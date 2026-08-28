import {
    isAddress,
    isHex,
    parseAbiItem,
    type AbiEvent,
    type Address,
    type Hash,
    type PublicClient,
} from "viem"

const FACTORY_REGISTRY_DEPLOYMENT_BLOCK = 1_831_776n
const FACTORY_REGISTRY_REORG_BUFFER = 5n
const FACTORY_REGISTRY_LOG_CHUNK_SIZE = 1_000_000n

const FACTORY_REGISTRY_CACHE_VERSION = 1
const FACTORY_REGISTRY_CACHE_PREFIX = "factory-registry-events"

const FACTORY_REGISTRY_CREATED_EVENT = parseAbiItem(
    "event Created(address indexed sender, address indexed owner, address proxy, uint256 proxyId)"
)
const FACTORY_REGISTRY_TRANSFER_EVENT = parseAbiItem(
    "event TransferProxyOwner(address indexed owner, address indexed newOwner, address proxy, uint256 proxyId)"
)

type FactoryRegistryEventKind = "Created" | "TransferProxyOwner"

interface FactoryRegistryEvent {
    kind: FactoryRegistryEventKind
    blockNumber: string
    logIndex: number
    transactionHash: Hash
    sender?: Address
    owner: Address
    newOwner?: Address
    proxy: Address
    proxyId: string
}

interface FactoryRegistryCache {
    version: number
    lastSyncedBlock: string
    events: FactoryRegistryEvent[]
}

export interface FactoryRegistryProxy {
    sender: Address
    owner: Address
    proxy: Address
    proxyId: string
}

export interface FactoryRegistrySyncStatus {
    latestBlock: bigint | null
    targetBlock: bigint | null
    syncedBlock: bigint | null
}

export interface FactoryRegistrySyncResult {
    proxies: FactoryRegistryProxy[]
    status: FactoryRegistrySyncStatus
    error: Error | null
}

type FactoryRegistryLogArguments = {
    sender?: Address
    owner?: Address
    newOwner?: Address
    proxy?: Address
    proxyId?: bigint
}

interface FactoryRegistryRpcLog {
    args?: FactoryRegistryLogArguments
    blockNumber: bigint | null
    logIndex: number | null
    transactionHash: Hash | null
    removed: boolean
}

interface FactoryRegistryLogQuery {
    address: Address
    event: AbiEvent
    args: Record<string, Address>
    fromBlock: bigint
    toBlock: bigint
}

interface FactoryRegistryLogRequest {
    kind: FactoryRegistryEventKind
    event: AbiEvent
    args: Record<string, Address>
}

type FactoryRegistryLogClient = Pick<PublicClient, "getBlockNumber" | "getLogs">

interface FactoryRegistrySyncOptions {
    client: FactoryRegistryLogClient
    chainId: number
    factoryAddress: Address
    account: Address
    onProgress?: (status: FactoryRegistrySyncStatus) => void
    shouldContinue?: () => boolean
}

class FactoryRegistrySyncCancelledError extends Error {
    constructor() {
        super("Factory registry sync cancelled.")
        this.name = "FactoryRegistrySyncCancelledError"
    }
}

const ensureSyncCanContinue = (shouldContinue?: () => boolean): void => {
    if (shouldContinue && !shouldContinue()) {
        throw new FactoryRegistrySyncCancelledError()
    }
}

const isLogRangeLimitError = (error: unknown): boolean => {
    if (!(error instanceof Error)) {
        return false
    }

    const message = error.message
    const describesLimitedRange =
        /\b(?:block|query) range\b/i.test(message) &&
        /\b(?:too (?:large|wide)|exceeds?|limit(?:ed)?|maximum|max)\b/i.test(message)

    return (
        describesLimitedRange ||
        /\bquery returned more than \d+ results\b/i.test(message) ||
        /\blog response size exceeded\b/i.test(message) ||
        /\bresponse body exceeded the size limit\b/i.test(message)
    )
}

const syncQueueByCacheKey = new Map<string, Promise<unknown>>()

const normaliseAddress = (address: Address): Address => address.toLowerCase() as Address

const minBigInt = (first: bigint, second: bigint): bigint => (first < second ? first : second)

const maxBigInt = (first: bigint, second: bigint): bigint => (first > second ? first : second)

const isNonNegativeIntegerString = (value: unknown): value is string =>
    typeof value === "string" && /^\d+$/.test(value)

const isStoredAddress = (value: unknown): value is Address =>
    typeof value === "string" && isAddress(value, { strict: false })

const isStoredTransactionHash = (value: unknown): value is Hash =>
    typeof value === "string" && isHex(value) && value.length === 66

const isStoredFactoryRegistryEvent = (value: unknown): value is FactoryRegistryEvent => {
    if (!value || typeof value !== "object") {
        return false
    }

    const event = value as Record<string, unknown>
    const hasCommonFields =
        (event.kind === "Created" || event.kind === "TransferProxyOwner") &&
        isNonNegativeIntegerString(event.blockNumber) &&
        Number.isInteger(event.logIndex) &&
        isStoredTransactionHash(event.transactionHash) &&
        isStoredAddress(event.owner) &&
        isStoredAddress(event.proxy) &&
        isNonNegativeIntegerString(event.proxyId)

    if (!hasCommonFields) {
        return false
    }

    if (event.kind === "Created") {
        return isStoredAddress(event.sender)
    }

    return isStoredAddress(event.newOwner)
}

const isFactoryRegistryCache = (value: unknown): value is FactoryRegistryCache => {
    if (!value || typeof value !== "object") {
        return false
    }

    const cache = value as Record<string, unknown>
    return (
        cache.version === FACTORY_REGISTRY_CACHE_VERSION &&
        isNonNegativeIntegerString(cache.lastSyncedBlock) &&
        Array.isArray(cache.events) &&
        cache.events.every(isStoredFactoryRegistryEvent)
    )
}

const getFactoryRegistryCacheKey = (
    chainId: number,
    factoryAddress: Address,
    account: Address
): string =>
    `${FACTORY_REGISTRY_CACHE_PREFIX}:v${FACTORY_REGISTRY_CACHE_VERSION}:${chainId}:${normaliseAddress(factoryAddress)}:${normaliseAddress(account)}`

const readFactoryRegistryCache = (cacheKey: string): FactoryRegistryCache | null => {
    if (typeof localStorage === "undefined") {
        return null
    }

    const rawCache = localStorage.getItem(cacheKey)
    if (!rawCache) {
        return null
    }

    try {
        const parsedCache: unknown = JSON.parse(rawCache)
        return isFactoryRegistryCache(parsedCache) ? parsedCache : null
    } catch {
        return null
    }
}

const writeFactoryRegistryCache = (cacheKey: string, cache: FactoryRegistryCache): void => {
    if (typeof localStorage === "undefined") {
        return
    }

    try {
        localStorage.setItem(cacheKey, JSON.stringify(cache))
    } catch (error) {
        console.warn("Unable to persist factory registry sync cache", error)
    }
}

const getEventKey = (event: FactoryRegistryEvent): string =>
    `${event.kind}:${event.transactionHash.toLowerCase()}:${event.logIndex}`

const compareEvents = (first: FactoryRegistryEvent, second: FactoryRegistryEvent): number => {
    const blockDifference = BigInt(first.blockNumber) - BigInt(second.blockNumber)
    if (blockDifference !== 0n) {
        return blockDifference < 0n ? -1 : 1
    }

    return first.logIndex - second.logIndex
}

const mergeFactoryRegistryEvents = (
    ...eventSets: FactoryRegistryEvent[][]
): FactoryRegistryEvent[] => {
    const eventsByKey = new Map<string, FactoryRegistryEvent>()
    for (const events of eventSets) {
        for (const event of events) {
            eventsByKey.set(getEventKey(event), event)
        }
    }

    return [...eventsByKey.values()].sort(compareEvents)
}

const toStoredEvent = (
    kind: FactoryRegistryEventKind,
    log: FactoryRegistryRpcLog
): FactoryRegistryEvent | null => {
    const args = log.args
    if (
        log.removed ||
        log.blockNumber === null ||
        log.logIndex === null ||
        log.transactionHash === null ||
        !args?.owner ||
        !args.proxy ||
        args.proxyId === undefined
    ) {
        return null
    }

    const commonEvent = {
        kind,
        blockNumber: log.blockNumber.toString(),
        logIndex: log.logIndex,
        transactionHash: log.transactionHash.toLowerCase() as Hash,
        owner: normaliseAddress(args.owner),
        proxy: normaliseAddress(args.proxy),
        proxyId: args.proxyId.toString(),
    }

    if (kind === "Created") {
        if (!args.sender) {
            return null
        }

        return {
            ...commonEvent,
            sender: normaliseAddress(args.sender),
        }
    }

    if (!args.newOwner) {
        return null
    }

    return {
        ...commonEvent,
        newOwner: normaliseAddress(args.newOwner),
    }
}

const getCurrentFactoryRegistryProxies = (
    events: FactoryRegistryEvent[],
    account: Address
): FactoryRegistryProxy[] => {
    const accountAddress = normaliseAddress(account)
    const currentProxies = new Map<Address, FactoryRegistryProxy>()

    for (const event of [...events].sort(compareEvents)) {
        const proxyAddress = normaliseAddress(event.proxy)

        if (event.kind === "Created") {
            if (normaliseAddress(event.owner) === accountAddress) {
                currentProxies.set(proxyAddress, {
                    sender: event.sender as Address,
                    owner: event.owner,
                    proxy: event.proxy,
                    proxyId: event.proxyId,
                })
            }
            continue
        }

        if (normaliseAddress(event.owner) === accountAddress) {
            currentProxies.delete(proxyAddress)
        }

        if (event.newOwner && normaliseAddress(event.newOwner) === accountAddress) {
            currentProxies.set(proxyAddress, {
                sender: event.owner,
                owner: event.newOwner,
                proxy: event.proxy,
                proxyId: event.proxyId,
            })
        }
    }

    return [...currentProxies.values()]
}

const fetchLogsForRange = async (
    client: FactoryRegistryLogClient,
    query: Omit<FactoryRegistryLogQuery, "fromBlock" | "toBlock">,
    fromBlock: bigint,
    toBlock: bigint,
    shouldContinue?: () => boolean
): Promise<FactoryRegistryRpcLog[]> => {
    const logs: FactoryRegistryRpcLog[] = []
    let nextBlock = fromBlock
    let chunkSize = minBigInt(FACTORY_REGISTRY_LOG_CHUNK_SIZE, toBlock - fromBlock + 1n)

    while (nextBlock <= toBlock) {
        ensureSyncCanContinue(shouldContinue)
        const chunkEnd = minBigInt(nextBlock + chunkSize - 1n, toBlock)

        try {
            const result = await client.getLogs({
                ...query,
                fromBlock: nextBlock,
                toBlock: chunkEnd,
            } as never)
            logs.push(...(result as unknown as FactoryRegistryRpcLog[]))
            nextBlock = chunkEnd + 1n
        } catch (error) {
            if (error instanceof FactoryRegistrySyncCancelledError) {
                throw error
            }

            if (chunkSize === 1n || !isLogRangeLimitError(error)) {
                throw error
            }

            chunkSize = maxBigInt(1n, chunkSize / 2n)
        }
    }

    return logs
}

const getLogRequests = (account: Address): FactoryRegistryLogRequest[] => [
    {
        kind: "Created",
        event: FACTORY_REGISTRY_CREATED_EVENT,
        args: { owner: account },
    },
    {
        kind: "TransferProxyOwner",
        event: FACTORY_REGISTRY_TRANSFER_EVENT,
        args: { owner: account },
    },
    {
        kind: "TransferProxyOwner",
        event: FACTORY_REGISTRY_TRANSFER_EVENT,
        args: { newOwner: account },
    },
]

const toSyncResult = (
    cache: FactoryRegistryCache | null,
    account: Address,
    status: FactoryRegistrySyncStatus,
    error: Error | null
): FactoryRegistrySyncResult => ({
    proxies: getCurrentFactoryRegistryProxies(cache?.events ?? [], account),
    status,
    error,
})

const toError = (error: unknown): Error =>
    error instanceof Error
        ? error
        : new Error("Unable to sync silo events from Sonic's public RPC.")

const performFactoryRegistrySync = async (
    { client, factoryAddress, account, onProgress, shouldContinue }: FactoryRegistrySyncOptions,
    cacheKey: string
): Promise<FactoryRegistrySyncResult> => {
    const cached = readFactoryRegistryCache(cacheKey)
    const cachedCursor = cached ? BigInt(cached.lastSyncedBlock) : null
    let workingCache = cached
    let latestBlock: bigint | null = null
    let targetBlock: bigint | null = null

    try {
        ensureSyncCanContinue(shouldContinue)
        latestBlock = await client.getBlockNumber()
        targetBlock =
            latestBlock > FACTORY_REGISTRY_REORG_BUFFER
                ? latestBlock - FACTORY_REGISTRY_REORG_BUFFER
                : 0n

        onProgress?.({
            latestBlock,
            targetBlock,
            syncedBlock: cachedCursor,
        })

        const scanFromBlock = cachedCursor
            ? maxBigInt(
                  FACTORY_REGISTRY_DEPLOYMENT_BLOCK,
                  cachedCursor - FACTORY_REGISTRY_REORG_BUFFER
              )
            : FACTORY_REGISTRY_DEPLOYMENT_BLOCK

        if (targetBlock < scanFromBlock) {
            return toSyncResult(
                cached,
                account,
                { latestBlock, targetBlock, syncedBlock: cachedCursor },
                null
            )
        }

        let events = (cached?.events ?? []).filter(
            (event) => BigInt(event.blockNumber) < scanFromBlock
        )

        let fromBlock = scanFromBlock
        while (fromBlock <= targetBlock) {
            ensureSyncCanContinue(shouldContinue)
            const toBlock = minBigInt(fromBlock + FACTORY_REGISTRY_LOG_CHUNK_SIZE - 1n, targetBlock)

            const eventSets = await Promise.all(
                getLogRequests(account).map(async ({ kind, ...query }) => {
                    const logs = await fetchLogsForRange(
                        client,
                        { address: factoryAddress, ...query },
                        fromBlock,
                        toBlock,
                        shouldContinue
                    )
                    return logs
                        .map((log) => toStoredEvent(kind, log))
                        .filter((event): event is FactoryRegistryEvent => event !== null)
                })
            )

            ensureSyncCanContinue(shouldContinue)
            events = mergeFactoryRegistryEvents(events, ...eventSets)

            const cache: FactoryRegistryCache = {
                version: FACTORY_REGISTRY_CACHE_VERSION,
                lastSyncedBlock: toBlock.toString(),
                events,
            }
            workingCache = cache
            writeFactoryRegistryCache(cacheKey, cache)
            onProgress?.({
                latestBlock,
                targetBlock,
                syncedBlock: toBlock,
            })

            fromBlock = toBlock + 1n
        }

        return toSyncResult(
            workingCache,
            account,
            { latestBlock, targetBlock, syncedBlock: targetBlock },
            null
        )
    } catch (error) {
        if (error instanceof FactoryRegistrySyncCancelledError) {
            throw error
        }

        const updatedCache = readFactoryRegistryCache(cacheKey) ?? workingCache
        if (!updatedCache) {
            throw error
        }

        const status = {
            latestBlock,
            targetBlock,
            syncedBlock: BigInt(updatedCache.lastSyncedBlock),
        }
        onProgress?.(status)
        return toSyncResult(updatedCache, account, status, toError(error))
    }
}

const runSerially = async <T>(cacheKey: string, task: () => Promise<T>): Promise<T> => {
    const previousTask = syncQueueByCacheKey.get(cacheKey) ?? Promise.resolve()
    const currentTask = previousTask.catch(() => undefined).then(task)
    syncQueueByCacheKey.set(cacheKey, currentTask)

    try {
        return await currentTask
    } finally {
        if (syncQueueByCacheKey.get(cacheKey) === currentTask) {
            syncQueueByCacheKey.delete(cacheKey)
        }
    }
}

export const syncFactoryRegistryLogs = async (
    options: FactoryRegistrySyncOptions
): Promise<FactoryRegistrySyncResult> => {
    const cacheKey = getFactoryRegistryCacheKey(
        options.chainId,
        options.factoryAddress,
        options.account
    )
    return runSerially(cacheKey, () => performFactoryRegistrySync(options, cacheKey))
}
