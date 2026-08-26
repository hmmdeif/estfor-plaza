<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">Withdraw Items</h3>

            <div class="flex justify-center gap-2">
                <button class="btn btn-primary btn-sm mt-5" @click="selectAll">Select All</button>
                <button class="btn btn-primary btn-sm mt-5" @click="selectNone">Select None</button>
            </div>

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="text-right">Amount</th>
                            <th class="text-right">Amount to withdraw</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in bankItems" :key="item.tokenId">
                            <td>
                                {{ getItemName(item.tokenId) || item.tokenId }}
                            </td>
                            <td class="text-right">{{ item.amount }}</td>
                            <td class="text-right">
                                <input
                                    type="number"
                                    dir="rtl"
                                    class="input input-bordered w-[100px] bg-base-100-50 text-right input-sm"
                                    v-model="item.amountToWithdraw"
                                    min="0"
                                    :max="item.amount"
                                />
                            </td>
                            <td class="justify-end items-center">
                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                    :disabled="loading || item.amount === '0'"
                                    @click="
                                        item.amountToWithdraw = Number(
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
                class="btn btn-primary mt-5 w-full"
                @click="withdrawItems"
                :disabled="loading || itemsToWithdraw.length === 0"
            >
                Withdraw {{ itemsToWithdraw.length }} Item{{
                    itemsToWithdraw.length === 1 ? "" : "s"
                }}
            </button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { getItemName } from "../../store/items"
import { useFactoryStore } from "../../store/factory"
import { useAppStore } from "../../store/app"
import { AggregatedItem } from "../../store/models/factory.models"
import type { SonicChainId } from "../../config"

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

const emits = defineEmits(["withdrawn"])

const factoryStore = useFactoryStore()
const app = useAppStore()

interface WithdrawItem {
    tokenId: number
    amount: string
    amountToWithdraw: number
}

const loading = ref(false)
const bankItems = ref<WithdrawItem[]>([])

const openDialog = (b: AggregatedItem[]) => {
    bankItems.value = b.map((item) => ({
        tokenId: item.tokenId,
        amount: item.amount,
        amountToWithdraw: 0,
    }))
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const itemsToWithdraw = computed(() => {
    return bankItems.value.filter((i) => i.amountToWithdraw > 0)
})

const selectAll = () => {
    bankItems.value.forEach((i) => {
        i.amountToWithdraw = Number(i.amount)
    })
}

const selectNone = () => {
    bankItems.value.forEach((i) => {
        i.amountToWithdraw = 0
    })
}

const withdrawItems = async () => {
    loading.value = true
    try {
        await factoryStore.withdrawItems(
            itemsToWithdraw.value.map((i) => ({
                tokenId: i.tokenId,
                amount: i.amountToWithdraw.toString(),
            })),
            props.chainId as SonicChainId
        )
        app.addToast(
            `${itemsToWithdraw.value.length} item${
                itemsToWithdraw.value.length !== 1 ? "s" : ""
            } withdrawn from bank`,
            "alert-success",
            5000
        )
        emits("withdrawn")
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
