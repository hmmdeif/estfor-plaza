<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <div v-if="!transferScreenSelected">
                <h3 class="font-bold text-lg text-center">
                    Execute {{ silosToExecute.length }} Action{{
                        silosToExecute.length === 1 ? "" : "s"
                    }}
                </h3>

                <div class="mt-5">
                    Please execute the following in order unless you know what
                    you're doing.
                </div>

                <button
                    type="button"
                    class="btn btn-primary mt-5 w-full"
                    @click="executeSavedTransactions"
                    :disabled="
                        loading ||
                        silosWithEmptyQueuesOrActionInputOnly.length === 0 ||
                        actionInputsExecuted
                    "
                >
                    1. Execute
                    {{ silosWithEmptyQueuesOrActionInputOnly.length }} Simple
                    Action{{
                        silosWithEmptyQueuesOrActionInputOnly.length === 1
                            ? ""
                            : "s"
                    }}
                </button>
                <button
                    type="button"
                    class="btn btn-primary mt-5 w-full"
                    @click="goToTransferScreen"
                    :disabled="loading || itemsTransferredToBank"
                >
                    2. Transfer Items to Bank
                </button>
                <button
                    v-if="silosWithActionChoicesOnly.length > 0"
                    type="button"
                    class="btn btn-primary mt-5 w-full"
                    @click="executeActionChoiceSavedTransactions"
                    :disabled="loading"
                >
                    3. Execute {{ silosWithActionChoicesOnly.length }} Complex
                    Action{{
                        silosWithActionChoicesOnly.length === 1 ? "" : "s"
                    }}
                </button>
                <label
                    v-if="silosWithActionChoicesOnly.length > 0"
                    class="label w-full cursor-pointer justify-between"
                >
                    <span class="text-xs mr-2 items-center flex">
                        Override missing items and execute anyway
                    </span>
                    <input
                        type="checkbox"
                        class="checkbox checkbox-primary"
                        v-model="executeComplexOverride"
                        @change="missingItems = []"
                    />
                </label>
                <label class="label w-full cursor-pointer justify-between">
                    <span class="text-xs mr-2 items-center flex">
                        Execute all transactions without waiting for
                        confirmation (can cause issues with some wallets)
                    </span>
                    <input
                        type="checkbox"
                        class="checkbox checkbox-primary"
                        v-model="shouldFastCall"
                    />
                </label>
                <div class="mt-5">
                    <div
                        v-for="item in missingItems"
                        :key="item"
                        class="text-error text-sm"
                    >
                        {{ item }}
                    </div>
                </div>
                <div v-if="loading && stage" class="mt-5">
                    {{ stage }}
                </div>
                <div
                    v-if="loading && factoryStore.currentTransactionNumber > 0"
                    class="mt-5"
                >
                    Executing
                    <span class="text-success">{{
                        factoryStore.currentTransactionNumber
                    }}</span>
                    of
                    <span class="text-success">{{
                        factoryStore.totalTransactionNumber
                    }}</span>
                    transactions
                </div>
                <div v-else-if="loading" class="mt-5">
                    Calculating transactions... Please wait
                </div>
                <div v-else-if="error" class="mt-5 text-error">
                    {{ error }}
                </div>
            </div>

            <div v-if="transferScreenSelected">
                <h3 class="font-bold text-lg text-center">
                    Transfer Items to Bank
                </h3>

                <div class="flex">
                    <button
                        type="button"
                        class="btn btn-primary btn-sm my-5"
                        @click="transferScreenSelected = false"
                    >
                        Go Back
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary btn-sm my-5 ms-2"
                        @click="selectAllItems(toggle)"
                    >
                        {{ toggle ? "Select" : "Deselect" }} All Items
                    </button>
                </div>

                <span
                    v-if="loading"
                    class="loading loading-spinner text-primary loading-md mx-auto text-gray-100"
                ></span>

                <div
                    v-if="!loading"
                    v-for="token in relevantTokens"
                    :key="token.tokenId"
                >
                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-5">
                            <input
                                type="checkbox"
                                v-model="token.selected"
                                :checked="token.selected"
                                class="checkbox checkbox-primary"
                            />
                            <span
                                class="text-sm mt-1 flex gap-2 items-center"
                            >
                                {{ getItemName(token.tokenId) }}
                            </span>
                        </label>
                    </div>
                </div>

                <div class="mt-5 text-sm">
                    Transfer will automatically ignore equipped items.
                </div>

                <button
                    type="button"
                    class="btn btn-primary mt-5 w-full"
                    @click="transferItemsToBank"
                    :disabled="
                        loading ||
                        itemsTransferredToBank ||
                        relevantTokens.filter((t) => t.selected).length === 0
                    "
                >
                    Transfer Items to Bank
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
import { getMultiUserItemNFTs, getUserItemNFTs } from "../../utils/api"
import { useAppStore } from "../../store/app"
import { getItemName, starterItems } from "../../store/items"
import { allItems } from "../../data/items"
import { allActions } from "../../data/actions"
import { NeededItem, ProxySilo } from "../../store/models/factory.models"
import type { SonicChainId } from "../../config"
import { Skill } from "@paintswap/estfor-definitions/types"
import { useMonsterStore } from "../../store/monsters"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    chainId: {
        type: Number,
        required: true,
    },
})

const factoryStore = useFactoryStore()
const monsterStore = useMonsterStore()
const app = useAppStore()

const loading = ref(false)
const actionInputsExecuted = ref(false)
const itemsTransferredToBank = ref(false)
const silosToExecute = ref<ProxySilo[]>([])
const missingItems = ref<string[]>([])
const transferScreenSelected = ref(false)
const toggle = ref(true)
const error = ref<string | null>(null)
const relevantTokens = ref<{ selected: boolean; tokenId: number }[]>([])
const stage = ref<string | null>(null)
const executeComplexOverride = ref(false)
const shouldFastCall = ref(false)

const silosWithEmptyQueuesOrActionInputOnly = computed(() => {
    return silosToExecute.value.filter(
        (s) =>
            s.queuedActions.length === 0 ||
            s.queuedActions.every((a) => a.choice === null)
    )
})

const silosWithActionChoicesOnly = computed(() => {
    return silosToExecute.value.filter(
        (s) =>
            s.queuedActions.length > 0 &&
            s.queuedActions.some((a) => a.choice !== null)
    )
})

const selectAllItems = (selected: boolean) => {
    for (const token of relevantTokens.value) {
        token.selected = selected
    }
    toggle.value = !toggle.value
}

const openDialog = (heroes: ProxySilo[]) => {
    itemsTransferredToBank.value = false
    actionInputsExecuted.value = false
    silosToExecute.value = heroes
    missingItems.value = []
    executeComplexOverride.value = false
    error.value = null
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const executeSavedTransactions = async () => {
    loading.value = true
    error.value = null
    try {
        if (props.chainId === 250) {
            await factoryStore.processActions(
                silosWithEmptyQueuesOrActionInputOnly.value,
                shouldFastCall.value,
                props.chainId as SonicChainId
            )
        } else {
            await factoryStore.executeSavedTransactions(
                silosWithEmptyQueuesOrActionInputOnly.value,
                shouldFastCall.value,
                props.chainId as SonicChainId
            )
        }
        app.addToast(
            `${silosWithEmptyQueuesOrActionInputOnly.value.length} hero${
                silosWithEmptyQueuesOrActionInputOnly.value.length !== 1
                    ? "es"
                    : ""
            } actions executed`,
            "alert-success",
            5000
        )
        actionInputsExecuted.value = true
    } catch (e: any) {
        // console.error(e)
        if (e.message?.indexOf("User rejected the request") > -1) {
            return
        }
        error.value =
            "Could not create a transaction. Please check your heroes have the correct tools equipped."
    } finally {
        loading.value = false
    }
}

const goToTransferScreen = async () => {
    transferScreenSelected.value = true
    loading.value = true
    toggle.value = true
    try {
        const result = await factoryStore.getRelevantItemsForProxies(
            silosToExecute.value,
        )
        relevantTokens.value = result.distinctItems
            .map((t) => ({
                selected: result.relevantTokenIds.includes(t),
                tokenId: t,
            }))
            .filter(
                (i) =>
                    allItems.find((t) => t.tokenId === i.tokenId)
                        ?.isTransferable && !starterItems.includes(i.tokenId)
            )
    } catch {
        //
    } finally {
        loading.value = false
    }
}

const transferItemsToBank = async () => {
    loading.value = true
    try {
        await factoryStore.transferItemsToBank(
            relevantTokens.value
                .filter((t) => t.selected)
                .map((t) => t.tokenId),
            silosToExecute.value,
            props.chainId as SonicChainId
        )
        app.addToast(`Items transferred to Bank`, "alert-success", 5000)
        itemsTransferredToBank.value = true
        transferScreenSelected.value = false
    } catch {
        // user declined tx
    } finally {
        loading.value = false
    }
}

const executeActionChoiceSavedTransactions = async () => {
    loading.value = true
    missingItems.value = []
    error.value = null
    stage.value = null
    try {
        const userItemNFTsResult = await getMultiUserItemNFTs(silosWithActionChoicesOnly.value.map(p => p.address), [])

        const itemsNeeded: NeededItem[] = []
        for (const proxy of silosWithActionChoicesOnly.value) {
            const userItemNFTResult = userItemNFTsResult.userItemNFTs.filter((u) =>
                u.user === proxy.address
            )
            for (const action of proxy.queuedActions.filter(
                (x) => x.choice !== null
            )) {
                const now = Date.now() / 1000
                if (action.skill === Skill.COMBAT) {
                    // work out the food needed
                    let elapsedHours = 0
                    if (Number(action.startTime) + action.timespan < now) {
                        elapsedHours = action.timespan / 60 / 60
                    } else if (Number(action.startTime) < now) {
                        elapsedHours = Math.ceil(
                            (now - Number(action.startTime)) / 60 / 60
                        )
                    }

                    const monster = allActions.find(
                        (x) => x.actionId === action.actionId
                    )
                    if (monster) {
                        const { totalFoodRequired, itemsConsumed } =
                            monsterStore.getKillsPerHourFromAction(
                                elapsedHours,
                                proxy,
                                action,
                                monster
                            )

                        // food
                        {
                            const ownedItem =
                                userItemNFTResult?.find(
                                    (t) => t.tokenId === action.regenerateId
                                )
                            if (
                                !ownedItem ||
                                Number(ownedItem.amount) < totalFoodRequired
                            ) {
                                const proxyItemsNeeded = itemsNeeded.find(
                                    (i) => i.address === proxy.address
                                )
                                const totalAmountRequired = Math.ceil(
                                    totalFoodRequired -
                                        (ownedItem
                                            ? Number(ownedItem.amount)
                                            : 0)
                                )
                                if (!proxyItemsNeeded) {
                                    itemsNeeded.push({
                                        address: proxy.address,
                                        items: [
                                            {
                                                tokenId: action.regenerateId,
                                                amount: totalAmountRequired,
                                            },
                                        ],
                                    })
                                } else {
                                    proxyItemsNeeded.items.push({
                                        tokenId: action.regenerateId,
                                        amount: totalAmountRequired,
                                    })
                                }
                            }
                        }

                        // consumables
                        for (const input of action.choice.inputTokenIds) {
                            const ownedItem =
                                userItemNFTResult?.find(
                                    (t) => t.tokenId === input
                                )
                            if (
                                !ownedItem ||
                                Number(ownedItem.amount) < itemsConsumed
                            ) {
                                const proxyItemsNeeded = itemsNeeded.find(
                                    (i) => i.address === proxy.address
                                )
                                const totalAmountRequired = Math.ceil(
                                    itemsConsumed -
                                        (ownedItem
                                            ? Number(ownedItem.amount)
                                            : 0)
                                )
                                if (!proxyItemsNeeded) {
                                    itemsNeeded.push({
                                        address: proxy.address,
                                        items: [
                                            {
                                                tokenId: input,
                                                amount: totalAmountRequired,
                                            },
                                        ],
                                    })
                                } else {
                                    proxyItemsNeeded.items.push({
                                        tokenId: input,
                                        amount: totalAmountRequired,
                                    })
                                }
                            }
                        }
                    }
                } else {
                    let i = 0
                    for (const input of action.choice.inputTokenIds) {
                        const ownedItem = userItemNFTResult?.find(
                            (t) => t.tokenId === input
                        )

                        let amountRequired = 0
                        if (Number(action.startTime) + action.timespan < now) {
                            amountRequired =
                                (action.choice.inputAmounts[i] *
                                    (action.choice.rate / 1000) *
                                    action.timespan) /
                                60 /
                                60
                        } else if (Number(action.startTime) < now) {
                            amountRequired =
                                action.choice.inputAmounts[i] *
                                (action.choice.rate / 1000) *
                                Math.ceil(
                                    (now - Number(action.startTime)) / 60 / 60
                                )
                        }

                        if (
                            !ownedItem ||
                            Number(ownedItem.amount) < amountRequired
                        ) {
                            const proxyItemsNeeded = itemsNeeded.find(
                                (i) => i.address === proxy.address
                            )
                            const totalAmountRequired = Math.ceil(
                                amountRequired -
                                    (ownedItem ? Number(ownedItem.amount) : 0)
                            )
                            if (!proxyItemsNeeded) {
                                itemsNeeded.push({
                                    address: proxy.address,
                                    items: [
                                        {
                                            tokenId: input,
                                            amount: totalAmountRequired,
                                        },
                                    ],
                                })
                            } else {
                                proxyItemsNeeded.items.push({
                                    tokenId: input,
                                    amount: totalAmountRequired,
                                })
                            }
                        }
                        i++
                    }
                }
            }
        }

        if (factoryStore.bank) {
            const itemResult = await getUserItemNFTs(
                factoryStore.bank?.address,
                [],
            )
            const bankItems = itemResult.userItemNFTs

            const itemTotals: { [key: string]: number } = {}
            for (const item of itemsNeeded) {
                for (const i of item.items) {
                    if (itemTotals[i.tokenId]) {
                        itemTotals[i.tokenId] += i.amount
                    } else {
                        itemTotals[i.tokenId] = i.amount
                    }
                }
            }

            for (const tokenId in itemTotals) {
                const ownedItem = bankItems.find(
                    (t) => Number(t.tokenId) === Number(tokenId)
                )
                if (
                    (!ownedItem ||
                        itemTotals[tokenId] > Number(ownedItem.amount)) &&
                    itemTotals[tokenId] < Number.POSITIVE_INFINITY
                ) {
                    if (executeComplexOverride.value) {
                        // get percentage of ownedItems vs itemTotals
                        const percentage =
                            Number(ownedItem?.amount || 0) / itemTotals[tokenId]

                        // balance the item totals with the percentage
                        for (const item of itemsNeeded.filter((x) =>
                            x.items.some((y) => y.tokenId === Number(tokenId))
                        )) {
                            for (const i of item.items.filter(
                                (x) => x.tokenId === Number(tokenId)
                            )) {
                                i.amount = Math.floor(i.amount * percentage)
                            }
                        }
                    } else {
                        missingItems.value.push(
                            `${
                                itemTotals[tokenId] -
                                Number(ownedItem?.amount || 0)
                            } ${getItemName(
                                Number(tokenId)
                            )} is missing from the Bank`
                        )
                    }
                }
            }

            if (missingItems.value.length === 0) {
                if (
                    itemsNeeded.filter((x) =>
                        x.items.some(
                            (i) =>
                                i.amount < Number.POSITIVE_INFINITY &&
                                i.tokenId > 0
                        )
                    ).length > 0
                ) {
                    stage.value = "Transferring items to heroes (Part 1 of 2)"
                    await factoryStore.transferItemsFromBankToProxys(
                        itemsNeeded,
                        props.chainId as SonicChainId
                    )
                }
                stage.value = "Executing actions (Part 2 of 2)"

                if (props.chainId === 250) {
                    await factoryStore.processActions(
                        silosWithActionChoicesOnly.value,
                        shouldFastCall.value,
                        props.chainId as SonicChainId
                    )
                } else {
                    await factoryStore.executeSavedTransactions(
                        silosWithActionChoicesOnly.value,
                        shouldFastCall.value,
                        props.chainId as SonicChainId
                    )
                }
                stage.value = null
                app.addToast(
                    `${silosWithActionChoicesOnly.value.length} hero${
                        silosWithActionChoicesOnly.value.length !== 1
                            ? "es"
                            : ""
                    } actions executed`,
                    "alert-success",
                    5000
                )
                await factoryStore.updateQueuedActions()
                const dialog = document.getElementById(
                    props.id
                ) as HTMLDialogElement
                dialog.close()
            }
        }
    } catch (e: any) {
        // console.error(e)
        if (e.message?.indexOf("User rejected the request") > -1) {
            return
        }
        error.value =
            "Could not create a transaction. Please check your heroes have the correct tools equipped."
    } finally {
        loading.value = false
        stage.value = null
    }
}

defineExpose({
    openDialog,
})
</script>
