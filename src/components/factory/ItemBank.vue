<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 w-full md:basis-3/4 xl:basis-1/2"
    >
        <div class="card-body">
            <h2 class="text-2xl font-bold text-center">Item Bank</h2>
            <h3 class="text-sm text-center">{{ bank?.address }}</h3>

            <div v-if="bank?.playerId !== ''">
                <b class="font-bold">{{ bank?.playerState.name }}</b> is the
                acting Treasurer. All items will be sent to and received from
                them.
            </div>

            <div
                v-if="
                    aggregatedItems?.filter(
                        (x) => !starterItems.includes(x.tokenId)
                    ).length > 0
                "
                class="overflow-x-auto mt-5"
            >
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-right">Amount</th>
                            <th class="text-right">Incoming / day</th>
                            <th class="text-right">Outgoing / day</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="item in aggregatedItems.filter(
                                (x) => !starterItems.includes(x.tokenId)
                            )"
                            :key="item.tokenId"
                        >
                            <td>
                                {{ getItemName(item.tokenId) || item.tokenId }}
                            </td>
                            <td class="text-right">{{ item.amount }}</td>
                            <td class="text-success text-right">
                                +{{ (item.rate * period).toFixed(0) }}
                            </td>
                            <td class="text-error text-right">
                                -{{ (item.outgoingRate * period).toFixed(0) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex">
                <button
                    type="button"
                    class="btn btn-primary mt-5 me-2"
                    @click="distributeItems"
                >
                    Distribute Items
                </button>
                <button
                    type="button"
                    class="btn btn-primary mt-5 grow"
                    @click="withdrawItems"
                >
                    Withdraw Items
                </button>
            </div>
        </div>
    </div>
    <WithdrawFromBank
        ref="withdrawFromBankRef"
        id="withdraw_from_bank_modal"
        :chainId="props.chainId"
    />
    <DistributeItemsFromBank
        ref="distributeItemsFromBank"
        id="distribute_items_from_bank_modal"
        :chainId="props.chainId"
    />
</template>

<script setup lang="ts">
import {
    getIncomingItems,
    getOutgoingItems,
    useFactoryStore,
} from "../../store/factory"
import { ComputedRef, computed, ref } from "vue"
import { getItemName, starterItems } from "../../store/items"
import { UserItemNFT } from "@paintswap/estfor-definitions/types"
import WithdrawFromBank from "../dialogs/WithdrawFromBank.vue"
import DistributeItemsFromBank from "../dialogs/DistributeItemsFromBank.vue"
import { allItems } from "../../data/items"
import { AggregatedItem } from "../../store/models/factory.models"
import type { SonicChainId } from "../../config"

const props = defineProps<{
    chainId: SonicChainId
}>()

const factoryStore = useFactoryStore()
const period = ref(24)
const bankItems = computed<UserItemNFT[]>(() => factoryStore.bankItems)

const withdrawFromBankRef = ref<typeof WithdrawFromBank>()
const distributeItemsFromBank = ref<typeof DistributeItemsFromBank>()

const bank = computed(() => {
    return factoryStore.bank
})

const aggregatedItems: ComputedRef<AggregatedItem[]> = computed(() => {
    const incomingItems: any[] = getIncomingItems(factoryStore.assignedProxys)
    const outgoingItems: any[] = getOutgoingItems(factoryStore.assignedProxys)

    // merge bankItems and incomingItems
    const mergedItems: AggregatedItem[] = bankItems.value.map((item) => {
        const incomingItem = incomingItems.find(
            (i) => i.itemTokenId === item.tokenId
        )
        const outgoingItem = outgoingItems.find(
            (i) => i.itemTokenId === item.tokenId
        )

        if (incomingItem || outgoingItem) {
            return {
                tokenId: item.tokenId,
                amount: item.amount,
                rate: incomingItem?.rate || 0,
                outgoingRate: outgoingItem?.rate || 0,
            }
        }
        return {
            tokenId: item.tokenId,
            amount: item.amount,
            rate: 0,
            outgoingRate: 0,
        }
    })

    // add missing incomingItems
    for (const item of incomingItems) {
        if (!mergedItems.find((i) => i.tokenId === item.itemTokenId)) {
            mergedItems.push({
                tokenId: item.itemTokenId,
                amount: "0",
                rate: item.rate,
                outgoingRate: 0,
            })
        }
    }

    // add missing outgoingItems
    for (const item of outgoingItems) {
        const existingItem = mergedItems.find(
            (i) => i.tokenId === item.itemTokenId
        )
        if (!existingItem) {
            mergedItems.push({
                tokenId: item.itemTokenId,
                amount: "0",
                rate: 0,
                outgoingRate: item.rate,
            })
        } else if (existingItem.amount === "0") {
            existingItem.outgoingRate = item.rate
        }
    }

    mergedItems.sort((a, b) => {
        if (a.rate > b.rate) return -1
        if (a.rate < b.rate) return 1
        return 0
    })

    return mergedItems.filter(
        (i) => allItems.find((t) => t.tokenId === i.tokenId)?.isTransferable
    )
})

const withdrawItems = async () => {
    withdrawFromBankRef.value?.openDialog(aggregatedItems.value)
}

const distributeItems = async () => {
    distributeItemsFromBank.value?.openDialog(aggregatedItems.value)
}
</script>
