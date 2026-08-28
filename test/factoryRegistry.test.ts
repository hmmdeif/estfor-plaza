import assert from "node:assert/strict"
import { beforeEach, test } from "node:test"
import type { Address, Hash } from "viem"

import { syncFactoryRegistryLogs } from "../src/utils/factoryRegistry.ts"

const DEPLOYMENT_BLOCK = 1_831_776n
const CHUNK_SIZE = 1_000_000n
const CHAIN_ID = 146
const FACTORY_ADDRESS = "0x32593d151d3ba6e0c9df933e522cc51f5ed50842" as Address
const ACCOUNT_ADDRESS = "0x1111111111111111111111111111111111111111" as Address
const PROXY_ADDRESS = "0x2222222222222222222222222222222222222222" as Address
const TRANSACTION_HASH = `0x${"a".repeat(64)}` as Hash

class MemoryStorage implements Storage {
    readonly #values = new Map<string, string>()

    get length(): number {
        return this.#values.size
    }

    clear(): void {
        this.#values.clear()
    }

    getItem(key: string): string | null {
        return this.#values.get(key) ?? null
    }

    key(index: number): string | null {
        return [...this.#values.keys()][index] ?? null
    }

    removeItem(key: string): void {
        this.#values.delete(key)
    }

    setItem(key: string, value: string): void {
        this.#values.set(key, value)
    }
}

Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: new MemoryStorage(),
})

beforeEach(() => localStorage.clear())

test("returns the locally indexed partial result when a later RPC chunk fails", async () => {
    const targetBlock = DEPLOYMENT_BLOCK + CHUNK_SIZE
    const client = {
        async getBlockNumber() {
            return targetBlock + 5n
        },
        async getLogs(parameters: unknown) {
            const query = parameters as {
                event: { name: string }
                fromBlock: bigint
            }
            if (query.fromBlock >= targetBlock) {
                throw new Error("RPC unavailable")
            }

            if (query.event.name !== "Created") {
                return []
            }

            return [
                {
                    args: {
                        sender: ACCOUNT_ADDRESS,
                        owner: ACCOUNT_ADDRESS,
                        proxy: PROXY_ADDRESS,
                        proxyId: 1n,
                    },
                    blockNumber: DEPLOYMENT_BLOCK,
                    logIndex: 0,
                    transactionHash: TRANSACTION_HASH,
                    removed: false,
                },
            ]
        },
    }

    const result = await syncFactoryRegistryLogs({
        client: client as never,
        chainId: CHAIN_ID,
        factoryAddress: FACTORY_ADDRESS,
        account: ACCOUNT_ADDRESS,
    })

    assert.equal(result.error?.message, "RPC unavailable")
    assert.equal(result.status.syncedBlock, targetBlock - 1n)
    assert.deepEqual(result.proxies, [
        {
            sender: ACCOUNT_ADDRESS,
            owner: ACCOUNT_ADDRESS,
            proxy: PROXY_ADDRESS,
            proxyId: "1",
        },
    ])
})

test("does not split the block range for an unrelated RPC error", async () => {
    let createdCalls = 0
    const client = {
        async getBlockNumber() {
            return DEPLOYMENT_BLOCK + CHUNK_SIZE + 4n
        },
        async getLogs(parameters: unknown) {
            const query = parameters as { event: { name: string } }
            if (query.event.name === "Created") {
                createdCalls += 1
                throw new Error("RPC unavailable")
            }

            return []
        },
    }

    await assert.rejects(
        syncFactoryRegistryLogs({
            client: client as never,
            chainId: CHAIN_ID,
            factoryAddress: FACTORY_ADDRESS,
            account: ACCOUNT_ADDRESS,
        }),
        /RPC unavailable/
    )
    assert.equal(createdCalls, 1)
})

test("splits the block range when the RPC range limit is exceeded", async () => {
    const targetBlock = DEPLOYMENT_BLOCK + 3n
    const createdRanges: Array<[bigint, bigint]> = []
    const client = {
        async getBlockNumber() {
            return targetBlock + 5n
        },
        async getLogs(parameters: unknown) {
            const query = parameters as {
                event: { name: string }
                fromBlock: bigint
                toBlock: bigint
            }
            if (query.event.name !== "Created") {
                return []
            }

            createdRanges.push([query.fromBlock, query.toBlock])
            if (query.toBlock - query.fromBlock + 1n > 2n) {
                throw new Error("Block range is too wide")
            }

            return []
        },
    }

    const result = await syncFactoryRegistryLogs({
        client: client as never,
        chainId: CHAIN_ID,
        factoryAddress: FACTORY_ADDRESS,
        account: ACCOUNT_ADDRESS,
    })

    assert.equal(result.error, null)
    assert.deepEqual(createdRanges, [
        [DEPLOYMENT_BLOCK, targetBlock],
        [DEPLOYMENT_BLOCK, DEPLOYMENT_BLOCK + 1n],
        [DEPLOYMENT_BLOCK + 2n, targetBlock],
    ])
})

test("serializes overlapping scans for the same wallet cache", async () => {
    let getBlockNumberCalls = 0
    let signalFirstGetLogsStarted: () => void = () => undefined
    let releaseFirstScan: () => void = () => undefined
    const firstGetLogsStarted = new Promise<void>((resolve) => {
        signalFirstGetLogsStarted = resolve
    })
    const firstScanGate = new Promise<void>((resolve) => {
        releaseFirstScan = resolve
    })

    const client = {
        async getBlockNumber() {
            getBlockNumberCalls += 1
            return DEPLOYMENT_BLOCK + 4n + BigInt(getBlockNumberCalls)
        },
        async getLogs() {
            if (getBlockNumberCalls === 1) {
                signalFirstGetLogsStarted()
                await firstScanGate
            }
            return []
        },
    }
    const options = {
        client: client as never,
        chainId: CHAIN_ID,
        factoryAddress: FACTORY_ADDRESS,
        account: ACCOUNT_ADDRESS,
    }

    const firstSync = syncFactoryRegistryLogs(options)
    await firstGetLogsStarted
    const secondSync = syncFactoryRegistryLogs(options)
    await new Promise<void>((resolve) => setImmediate(resolve))

    assert.equal(getBlockNumberCalls, 1)

    releaseFirstScan()
    const [firstResult, secondResult] = await Promise.all([firstSync, secondSync])

    assert.equal(getBlockNumberCalls, 2)
    assert.equal(firstResult.status.syncedBlock, DEPLOYMENT_BLOCK)
    assert.equal(secondResult.status.syncedBlock, DEPLOYMENT_BLOCK + 1n)
})

test("cancels a scan when the caller invalidates it", async () => {
    let logCalls = 0
    let shouldContinue = true
    const targetBlock = DEPLOYMENT_BLOCK + CHUNK_SIZE + 1n
    const client = {
        async getBlockNumber() {
            return targetBlock + 5n
        },
        async getLogs() {
            logCalls += 1
            return []
        },
    }

    const syncPromise = syncFactoryRegistryLogs({
        client: client as never,
        chainId: CHAIN_ID,
        factoryAddress: FACTORY_ADDRESS,
        account: ACCOUNT_ADDRESS,
        shouldContinue: () => shouldContinue,
        onProgress(status) {
            if (status.syncedBlock === DEPLOYMENT_BLOCK + CHUNK_SIZE - 1n) {
                shouldContinue = false
            }
        },
    })

    await assert.rejects(syncPromise, /cancel/i)
    assert.equal(logCalls, 3)
})
