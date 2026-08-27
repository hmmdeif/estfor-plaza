<template>
    <dialog id="view_silos_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">View Silos</h3>

            <div v-if="!selectedSilo" class="overflow-x-auto">
                <div class="flex join items-center justify-end my-5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 mr-2 text-primary"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search"
                        class="input input-bordered bg-base-100-50 input-sm"
                        v-model="searchValue"
                    />
                </div>

                <div class="overflow-x-auto">
                    <table class="table md:table-sm table-xs">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Heroes</th>
                                <th class="flex justify-end"><button class="btn btn-primary btn-sm" @click="activateInactiveHeroes" :disabled="loading">Activate Inactive Heroes</button></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="silo in allSilos" :key="silo.index">
                                <td>{{ silo.index }}</td>
                                <td v-if="silo.allPlayers.length > 0">
                                    <div
                                        v-for="player in silo.allPlayers"
                                        :key="player.tokenId"
                                    >
                                        <span
                                            :class="{
                                                'text-warning':
                                                    !player.isActive,
                                            }"
                                            >{{ player.name }}</span
                                        >
                                        {{ player.isActive ? "(active)" : "" }}
                                    </div>
                                </td>
                                <td v-else class="text-gray-400">No heroes</td>
                                <td class="flex justify-end">
                                    <button
                                        type="button"
                                        class="btn btn-primary btn-sm"
                                        @click="showSilo(silo.index)"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <button
                    type="button"
                    class="btn btn-primary w-full mt-5"
                    @click="exportSilos"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="#fff"
                        class="w-6 h-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                    </svg>
                </button>
            </div>

            <div v-if="selectedSilo">
                <div class="flex justify-between">
                    <button
                        type="button"
                        class="btn btn-primary btn-sm mt-5"
                        @click="goBack()"
                    >
                        Go Back
                    </button>
                    <div>
                        <button
                            type="button"
                            class="btn btn-primary btn-sm mt-5 me-2"
                            :disabled="
                                loading ||
                                factoryStore.proxys.findIndex(
                                    (p) => p.address === selectedSilo?.address
                                ) === 0
                            "
                            @click="selectPreviousHero()"
                        >
                            Previous Hero
                        </button>
                        <button
                            type="button"
                            class="btn btn-primary btn-sm mt-5"
                            :disabled="
                                loading ||
                                factoryStore.proxys.findIndex(
                                    (p) => p.address === selectedSilo?.address
                                ) ===
                                    factoryStore.proxys.length - 1
                            "
                            @click="selectNextHero()"
                        >
                            Next Hero
                        </button>
                    </div>
                </div>

                <label class="form-control w-full mt-5">
                    <div class="label">
                        <span class="text-sm">Hero Transfer Address</span>
                    </div>
                    <input
                        type="text"
                        placeholder="0x..."
                        class="input input-bordered input-sm bg-base-100-50"
                        v-model="toAddress"
                    />
                </label>

                <div class="overflow-x-auto mt-5">
                    <table class="table md:table-sm table-xs">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="hero in selectedSilo.allPlayers"
                                :key="hero.tokenId"
                            >
                                <td>
                                    <b>{{ hero.name }}</b>
                                    <span
                                        v-if="hero.isActive"
                                        class="text-success"
                                    >
                                        (active)</span
                                    >
                                </td>
                                <td class="flex justify-end">
                                    <button
                                        type="button"
                                        class="btn btn-primary btn-sm me-2"
                                        :disabled="
                                            loading ||
                                            selectedSilo.playerId !== ''
                                        "
                                        @click="setActive(hero.tokenId)"
                                    >
                                        Set Active
                                    </button>
                                    <button
                                        type="button"
                                        class="btn btn-primary btn-sm"
                                        :disabled="loading"
                                        @click="transferHero(hero.tokenId)"
                                    >
                                        Transfer Hero
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr class="mt-5" />

                <label class="form-control w-full mt-5">
                    <div class="label">
                        <span class="text-sm">Item Transfer Address</span>
                    </div>
                    <input
                        type="text"
                        placeholder="0x..."
                        class="input input-bordered input-sm bg-base-100-50"
                        v-model="itemToAddress"
                    />
                    <div class="label justify-between">
                        <span></span>
                        <span class="text-xs text-base-content/60"
                            >Defaults to your Item Bank</span
                        >
                    </div>
                </label>

                <div class="overflow-x-auto mt-5">
                    <table class="table md:table-sm table-xs">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>Transfer Amount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="item in selectedSiloItems"
                                :key="item.tokenId"
                            >
                                <td>
                                    <b>{{ getItemName(item.tokenId) }}</b>
                                </td>
                                <td>{{ item.amount }}</td>
                                <td class="items-center text-right">
                                    <input
                                        type="number"
                                        dir="rtl"
                                        step="1"
                                        min="0"
                                        class="input input-sm input-bordered bg-base-100-50 w-[100px]"
                                        v-model="item.transferAmount"
                                    />
                                </td>
                                <td class="justify-end items-center">
                                    <button
                                        type="button"
                                        class="btn btn-primary btn-sm"
                                        :disabled="
                                            loading || item.amount === '0'
                                        "
                                        @click="
                                            item.transferAmount = Number(
                                                item.amount
                                            )
                                        "
                                    >
                                        Max
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <button
                    type="button"
                    class="btn btn-primary btn-sm w-full mt-5"
                    :disabled="loading"
                    @click="transferItems"
                >
                    Transfer Items
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useFactoryStore } from "../../store/factory"
import { getUserItemNFTs } from "../../utils/api"
import { getAccount } from "@wagmi/core"
import { getItemName } from "../../store/items"
import { config, type SonicChainId } from "../../config"
import {
    ProxySilo,
    TransferUserItemNFT,
} from "../../store/models/factory.models"

const props = defineProps<{
    chainId: SonicChainId
}>()

const factoryStore = useFactoryStore()
const allSilos = computed(() =>
    factoryStore.proxys.filter((p) =>
        searchValue.value !== ""
            ? p.allPlayers.some(
                  (a) =>
                      a.name
                          ?.toLowerCase()
                          .includes(searchValue.value?.toLowerCase())
              )
            : true
    )
)
const searchValue = ref("")
const selectedSilo = ref<ProxySilo | null>(null)
const selectedSiloItems = ref<TransferUserItemNFT[]>([])
const toAddress = ref(getAccount(config)?.address || "")
const itemToAddress = ref(
    factoryStore.bank?.address || getAccount(config)?.address || ""
)
const loading = ref(false)

const openDialog = () => {
    const dialog = document.getElementById(
        "view_silos_modal"
    ) as HTMLDialogElement
    dialog.showModal()
}

const showSilo = async (index: number) => {
    loading.value = true
    try {
        selectedSilo.value =
            factoryStore.proxys.find((p) => p.index === index) || null
        if (selectedSilo.value) {
            const itemResult = await getUserItemNFTs(
                selectedSilo.value.address,
                [],
            )
            selectedSiloItems.value = itemResult.userItemNFTs.map((i) => {
                return {
                    ...i,
                    transferAmount: 0,
                }
            })
        }
    } catch {
        // console.log(e)
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    selectedSilo.value = null
    selectedSiloItems.value = []
}

const selectPreviousHero = async () => {
    const currentSiloIndex = factoryStore.proxys.findIndex(
        (p) => p.address === selectedSilo.value?.address
    )
    if (currentSiloIndex > 0) {
        await showSilo(factoryStore.proxys[currentSiloIndex - 1].index)
    }
}

const selectNextHero = async () => {
    const currentSiloIndex = factoryStore.proxys.findIndex(
        (p) => p.address === selectedSilo.value?.address
    )
    if (currentSiloIndex < factoryStore.proxys.length - 1) {
        await showSilo(factoryStore.proxys[currentSiloIndex + 1].index)
    }
}

const transferHero = async (tokenId: string) => {
    if (!selectedSilo.value || toAddress.value === "") return
    loading.value = true
    try {
        await factoryStore.transferHero(
            selectedSilo.value.address,
            tokenId,
            toAddress.value
        )
    } catch {
        // user declined tx
        // console.log(e)
    } finally {
        loading.value = false
    }
}

const setActive = async (tokenId: string) => {
    if (!selectedSilo.value) return
    loading.value = true
    try {
        await factoryStore.setActive(selectedSilo.value.address, tokenId)
    } catch {
        // user declined tx
        // console.log(e)
    } finally {
        loading.value = false
    }
}

const transferItems = async () => {
    if (!selectedSilo.value || itemToAddress.value === "") return
    loading.value = true
    try {
        await factoryStore.transferItemsToAddress(
            selectedSilo.value.address,
            itemToAddress.value,
            selectedSiloItems.value.filter((i) => i.transferAmount > 0),
            props.chainId
        )
    } catch {
        // user declined tx
        // console.log(e)
    } finally {
        loading.value = false
    }
}

const exportSilos = () => {
    const silos = allSilos.value.map((h) => {
        return {
            id: h.index,
            heroes: `"${h.allPlayers.map((p) => p.name).join(",")}"`,
            address: h.address,
            activePlayerId: h.playerId,
        }
    })

    // convert heroes to text/csv
    const silosHeader = Object.keys(silos[0]).join(",")
    let silosCSV = silos
        .map((h) => {
            return Object.values(h).join(",")
        })
        .join("\n")
    silosCSV = `${silosHeader}\n${silosCSV}`

    const data = new Blob([silosCSV], { type: "text/csv" })
    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = "silos.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
}

const activateInactiveHeroes = async () => {
    loading.value = true
    const inactiveHeroes = allSilos.value.filter((s) => !s.allPlayers.some((p) => p.isActive)).map((s) => ({ address: s.address, playerId: s.allPlayers[0]?.tokenId })).filter((h) => h.playerId)
    try {
        await factoryStore.activateHeroes(inactiveHeroes, props.chainId)
    } catch {
        // user declined tx
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
