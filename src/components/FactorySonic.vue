<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 mx-auto w-[760px]"
    >
        <div class="card-body">
            <p>
                Welcome to the Factory floor! Here you can create silos for your
                Estfor heroes and tell them to do things.
            </p>
            <p v-if="!hasRubyBrooch" class="alert alert-warning my-5">
                <img
                    src="/src/assets/ruby_brooch_icon.png"
                    class="rounded-lg w-[20px] inline cursor-pointer"
                    alt="Ruby Brooch"
                    @click.prevent="rubyBroochPaywallRef?.openDialog()"
                />
                <span
                    >As you don't have a Ruby Brooch, you do not get the full
                    benefits of the Factory - there is a
                    {{
                        Number(
                            factoryStore.transactionCharge / BigInt(10 ** 15)
                        ) / 1000 || "small"
                    }}
                    S charge per execution, and you cannot batch execute
                    actions.<br />If you want to get a Ruby Brooch, first get an
                    Emerald Brooch (click the tree icon in the top left), then
                    click the Ruby brooch to the left of this message.</span
                >
            </p>
            <div v-if="loading">
                Loading heroes...
                <span
                    class="loading loading-spinner text-white loading-md mx-2"
                ></span>
            </div>
            <div v-else>
                <p>
                    You currently have
                    <span class="text-lg text-success">{{
                        factoryStore.proxys.length
                    }}</span>
                    silos.
                </p>
                <p class="alert alert-warning my-5">
                    Silo creation is currently extremely slow due to The Graph indexers being slow. It can take up to 15 minutes for your silos to appear. If the transaction was successful please wait for it to appear.
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
                    <button
                        type="button"
                        class="btn btn-primary mt-5 me-2"
                        @click="viewSilos"
                    >
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
        <ItemBank
            v-if="!loading && factoryStore.proxys.length > 0"
            :chainId="chainId"
        />
        <AssignedSilos
            v-if="!loading && factoryStore.assignedProxys.length > 0"
            :chainId="chainId"
        />
    </div>
    <ViewSilos ref="viewSilosRef" :chainId="chainId" />
    <RubyBroochPaywall
        ref="rubyBroochPaywallRef"
        id="factory_ruby_brooch_modal"
    />
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount } from "vue"
import { useFactoryStore } from "../store/factory"
import { useAppStore } from "../store/app"

import EmptySilos from "./factory/EmptySilos.vue"
import UnassignedSilos from "./factory/UnassignedSilos.vue"
import AssignedSilos from "./factory/AssignedSilos.vue"
import { getAccount, watchAccount, switchChain } from "@wagmi/core"
import ItemBank from "./factory/ItemBank.vue"
import ViewSilos from "./dialogs/ViewSilos.vue"
import { config, SONIC_CHAIN_ID, type SonicChainId } from "../config"
import { useBroochStore } from "../store/brooch"
import RubyBroochPaywall from "./dialogs/RubyBroochPaywall.vue"
import { sleep } from "../utils/time"
import { querySubgraph } from "../utils/graphql"

const factoryStore = useFactoryStore()
const app = useAppStore()
const broochStore = useBroochStore()
const loading = ref(factoryStore.initialised === false)
const creating = ref(false)
const silosToCreate = ref(5)

const chainId = ref<SonicChainId>(SONIC_CHAIN_ID)

const viewSilosRef = ref<typeof ViewSilos>()

const hasRubyBrooch = computed(() => broochStore.hasAccess(1))
const factoryAccount = ref(getAccount(config))

const rubyBroochPaywallRef = ref<typeof RubyBroochPaywall>()

interface FactoryRegistryCreated {
    sender: string
    owner: string
    proxy: string
    proxyId: string
}

interface FactoryRegistryCreatedsData {
    factoryRegistryCreateds: FactoryRegistryCreated[]
}

const GET_SONIC_PROXYS = `
    query getSonicProxys($offset: Int, $acc: String!) {
        factoryRegistryCreateds(skip: $offset, where: { owner: $acc }) {
            sender
            owner
            proxy
            proxyId
        }
    }
`

let proxyRequestId = 0

const loadProxys = async (): Promise<boolean> => {
    const requestId = ++proxyRequestId
    const acc = factoryAccount.value.address
    if (!acc) {
        loading.value = false
        return true
    }

    try {
        const proxys: FactoryRegistryCreated[] = []
        while (true) {
            const data = await querySubgraph<
                FactoryRegistryCreatedsData,
                { offset: number; acc: string }
            >(import.meta.env.VITE_SONIC_SUBGRAPH_URL, GET_SONIC_PROXYS, {
                offset: proxys.length,
                acc,
            })
            const page = data.factoryRegistryCreateds
            proxys.push(...page)
            if (page.length === 0) {
                break
            }
        }

        if (requestId !== proxyRequestId) {
            return true
        }

        await factoryStore.setProxys(proxys)
        await factoryStore.getAllProxyStates(chainId.value)
        return true
    } catch (error) {
        console.error("Failed to load factory silos", error)
        return false
    } finally {
        if (requestId === proxyRequestId) {
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
            `${silosToCreate.value} silo${
                silosToCreate.value > 1 ? "s" : ""
            } created`,
            "alert-success",
            5000
        )

        while (factoryStore.proxys.length === originalProxyCount) {
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

watchAccount(config, {
    onChange() {
        factoryAccount.value = getAccount(config)
        void loadProxys()
    },
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
