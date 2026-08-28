<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto w-[760px]">
        <div class="card-body">
            <p>
                Welcome to the Factory floor! Here you can create silos for your Estfor heroes and
                tell them to do things.
            </p>
            <p v-if="!hasRubyBrooch" class="alert alert-warning my-5">
                <img
                    src="/src/assets/optimized/ruby-brooch-icon-80.webp"
                    class="rounded-lg w-[20px] inline cursor-pointer"
                    alt="Ruby Brooch"
                    width="80"
                    height="79"
                    decoding="async"
                    @click.prevent="rubyBroochPaywallRef?.openDialog()"
                />
                <span
                    >As you don't have a Ruby Brooch, you do not get the full benefits of the
                    Factory - there is a
                    {{
                        Number(factoryStore.transactionCharge / BigInt(10 ** 15)) / 1000 || "small"
                    }}
                    S charge per execution, and you cannot batch execute actions.<br />If you want
                    to get a Ruby Brooch, first get an Emerald Brooch (click the tree icon in the
                    top left), then click the Ruby brooch to the left of this message.</span
                >
            </p>
            <div
                v-if="canSyncSilos"
                class="alert alert-soft my-5 flex flex-col items-stretch gap-3 border-secondary/50 bg-base-100/80 text-base-content"
                role="status"
                aria-live="polite"
            >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p class="font-semibold">Silo event sync</p>
                        <p class="text-sm">
                            Synced through block
                            <span class="font-mono">{{ formatBlock(syncStatus.syncedBlock) }}</span>
                            of safe target
                            <span class="font-mono">{{ formatBlock(syncStatus.targetBlock) }}</span>
                            (latest
                            <span class="font-mono">{{ formatBlock(syncStatus.latestBlock) }}</span
                            >).
                        </p>
                    </div>
                    <button
                        type="button"
                        class="btn btn-primary btn-sm min-w-28"
                        @click="loadProxys"
                        :disabled="loading || syncing || !factoryAccount.address"
                    >
                        <span
                            v-if="syncing"
                            class="loading loading-spinner loading-xs"
                            aria-hidden="true"
                        ></span>
                        {{ syncing ? "Syncing..." : "Sync silos" }}
                    </button>
                </div>
                <p class="text-xs">
                    New silo events are read from Sonic's public RPC after a five-block reorg
                    buffer.
                </p>
                <p v-if="syncError" class="text-sm text-error">
                    {{ syncError }}
                </p>
            </div>
            <div v-if="loading">
                Loading heroes...
                <span class="loading loading-spinner text-white loading-md mx-2"></span>
            </div>
            <div v-else>
                <p>
                    You currently have
                    <span class="text-lg text-success">{{ factoryStore.proxys.length }}</span>
                    silos.
                </p>
                <div class="flex justify-start mt-5">
                    <label class="form-control w-full">
                        <div class="label">
                            <span class="text-sm">Silos to create</span>
                        </div>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            class="input input-sm input-bordered bg-base-100-50"
                            v-model="silosToCreate"
                        />
                    </label>
                </div>
                <div class="flex">
                    <button type="button" class="btn btn-primary mt-5 me-2" @click="viewSilos">
                        View Silos
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary mt-5 grow"
                        @click="createSilos"
                        :disabled="loading || creating"
                    >
                        Create {{ Math.floor(silosToCreate) }} Silo{{
                            silosToCreate > 1 ? "s" : ""
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="lg:flex flex-row justify-evenly items-start gap-10">
        <EmptySilos
            v-if="!loading && factoryStore.emptyProxys.length > 0"
            @create-heroes="onCreateHeroes"
            :chainId="chainId"
        />
        <UnassignedSilos
            v-if="!loading && factoryStore.unassignedProxys.length > 0"
            :chainId="chainId"
        />
    </div>
    <div class="lg:flex flex-row justify-evenly items-start gap-10">
        <ItemBank v-if="!loading && factoryStore.proxys.length > 0" :chainId="chainId" />
        <AssignedSilos
            v-if="!loading && factoryStore.assignedProxys.length > 0"
            :chainId="chainId"
        />
    </div>
    <ViewSilos ref="viewSilosRef" :chainId="chainId" />
    <RubyBroochPaywall ref="rubyBroochPaywallRef" id="factory_ruby_brooch_modal" />
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount, onBeforeUnmount } from "vue"
import { useFactoryStore } from "../store/factory"
import { useAppStore } from "../store/app"

import EmptySilos from "./factory/EmptySilos.vue"
import UnassignedSilos from "./factory/UnassignedSilos.vue"
import AssignedSilos from "./factory/AssignedSilos.vue"
import { getAccount, getPublicClient, watchAccount, switchChain } from "@wagmi/core"
import type { Address as ViemAddress } from "viem"
import ItemBank from "./factory/ItemBank.vue"
import ViewSilos from "./dialogs/ViewSilos.vue"
import { config, siloSyncConfig, SONIC_CHAIN_ID, type SonicChainId } from "../config"
import { useBroochStore } from "../store/brooch"
import RubyBroochPaywall from "./dialogs/RubyBroochPaywall.vue"
import { sleep } from "../utils/time"
import { Address, useCoreStore } from "../store/core"
import { syncFactoryRegistryLogs, type FactoryRegistrySyncStatus } from "../utils/factoryRegistry"
import { canSyncFactorySilos } from "../utils/factorySync"

const factoryStore = useFactoryStore()
const app = useAppStore()
const broochStore = useBroochStore()
const coreStore = useCoreStore()
const loading = ref(factoryStore.initialised === false)
const creating = ref(false)
const silosToCreate = ref(5)
const syncing = ref(false)
const syncStatus = ref<FactoryRegistrySyncStatus>({
    syncedBlock: null,
    targetBlock: null,
    latestBlock: null,
})
const syncError = ref<string | null>(null)

const chainId = ref<SonicChainId>(SONIC_CHAIN_ID)

const viewSilosRef = ref<typeof ViewSilos>()

const hasRubyBrooch = computed(() => broochStore.hasAccess(1))
const factoryAccount = ref(getAccount(config))

const rubyBroochPaywallRef = ref<typeof RubyBroochPaywall>()

const canSyncSilos = computed(() =>
    canSyncFactorySilos({
        playerId: coreStore.playerId,
        playerOwner: coreStore.playerState.owner,
        accountAddress: factoryAccount.value.address,
    })
)

let proxyRequestId = 0

const formatBlock = (block: bigint | null): string =>
    block === null ? "—" : block.toLocaleString()

const loadProxys = async (): Promise<boolean> => {
    const requestId = ++proxyRequestId
    const account = getAccount(config)
    const accountAddress = account.address
    if (!accountAddress) {
        factoryStore.reset()
        syncing.value = false
        syncStatus.value = {
            syncedBlock: null,
            targetBlock: null,
            latestBlock: null,
        }
        syncError.value = null
        loading.value = false
        return true
    }

    // The store is a singleton, so if it holds data initialised for another
    // wallet (e.g. after disconnect/reconnect) clear it before loading.
    if (factoryStore.initialised && factoryStore.initialisedFor !== account.address) {
        factoryStore.reset()
        loading.value = true
    }

    if (!canSyncSilos.value) {
        factoryStore.reset()
        syncing.value = false
        syncStatus.value = {
            syncedBlock: null,
            targetBlock: null,
            latestBlock: null,
        }
        syncError.value = null
        loading.value = false
        return true
    }

    const factoryAddress = coreStore.getAddress(Address.factoryRegistry, chainId.value)
    if (!factoryAddress) {
        syncing.value = false
        loading.value = false
        syncError.value = "The Sonic factory registry address is unavailable."
        return false
    }

    syncing.value = true
    syncError.value = null

    try {
        const publicClient = getPublicClient(siloSyncConfig, {
            chainId: chainId.value,
        })
        if (!publicClient) {
            throw new Error("The Sonic public RPC client is unavailable.")
        }

        const result = await syncFactoryRegistryLogs({
            client: publicClient,
            chainId: chainId.value,
            factoryAddress: factoryAddress as ViemAddress,
            account: accountAddress as ViemAddress,
            shouldContinue: () => {
                const currentAccount = getAccount(config)
                return (
                    requestId === proxyRequestId &&
                    currentAccount.isConnected &&
                    currentAccount.address?.toLowerCase() === accountAddress.toLowerCase() &&
                    canSyncSilos.value
                )
            },
            onProgress(status) {
                if (requestId !== proxyRequestId) {
                    return
                }
                syncStatus.value = status
            },
        })

        if (requestId !== proxyRequestId) {
            return true
        }

        syncStatus.value = result.status
        syncError.value = result.error?.message ?? null
        await factoryStore.hydrateProxys(
            result.proxies,
            chainId.value,
            accountAddress,
            () => requestId === proxyRequestId
        )
        return true
    } catch (error) {
        console.error("Failed to load factory silos", error)
        if (requestId === proxyRequestId) {
            syncError.value =
                error instanceof Error
                    ? error.message
                    : "Unable to sync silo events from Sonic's public RPC."
        }
        return false
    } finally {
        if (requestId === proxyRequestId) {
            syncing.value = false
            loading.value = false
        }
    }
}

const onCreateHeroes = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await loadProxys()
}

const createSilos = async () => {
    creating.value = true
    try {
        const originalProxyCount = factoryStore.proxys.length
        await factoryStore.createProxy(silosToCreate.value, chainId.value)
        app.addToast(
            `${silosToCreate.value} silo${silosToCreate.value > 1 ? "s" : ""} created`,
            "alert-success",
            5000
        )

        while (canSyncSilos.value && factoryStore.proxys.length === originalProxyCount) {
            if (!(await loadProxys())) {
                throw new Error("Failed to refresh factory silos")
            }
            await sleep(5000)
        }
    } catch {
        // user rejected tx
        // console.error(e)
    } finally {
        creating.value = false
    }
}

const viewSilos = () => {
    viewSilosRef.value?.openDialog()
}

const unwatchAccount = watchAccount(config, {
    onChange() {
        factoryAccount.value = getAccount(config)
        void loadProxys()
    },
})

onBeforeUnmount(() => {
    proxyRequestId += 1
    unwatchAccount()
})

onBeforeMount(() => {
    const account = getAccount(config)
    if (account.isConnected) {
        if (account.chainId !== SONIC_CHAIN_ID) {
            switchChain(config, { chainId: SONIC_CHAIN_ID })
        }
    }
    void loadProxys()
})
</script>
