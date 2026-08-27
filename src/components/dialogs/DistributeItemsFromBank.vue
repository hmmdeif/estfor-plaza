<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">Distribute Items</h3>

            <div class="mt-5">
                For distributing tools to heroes. The Factory will automatically
                take raw materials as required, so no need to distribute them
                manually.
            </div>

            <AssignedHeroGroupSelect
                class="mt-5"
                custom-class="select-md"
                label="Group to distribute to"
                v-model="selectedHeroGroup"
                :heroes="factoryStore.assignedProxys"
                @update:modelValue="onUpdateHeroGroup"
            />

            <label class="form-control w-full mt-5">
                <div class="label">
                    <span class="text-sm">Item to distribute</span>
                </div>
                <select class="select select-bordered w-full" v-model="item">
                    <option
                        v-for="o in bankItems"
                        :key="o.tokenId"
                        :value="o.tokenId"
                    >
                        {{ getItemName(o.tokenId) || "" }} ({{ o.amount }}
                        available)
                    </option>
                </select>
            </label>

            <label class="form-control w-full mt-5">
                <div class="label">
                    <span class="text-sm">Amount to distribute</span>
                </div>
                <div class="flex flex-row gap-2">
                    <input
                        type="number"
                        dir="rtl"
                        class="input input-bordered w-full bg-base-100-50 input-sm"
                        v-model="helperAmount"
                        min="0"
                        :max="
                            Math.floor(
                                Number(
                                    bankItems.find((i) => i.tokenId === item)?.amount || 0
                                ) / heroes.length
                            )
                        "
                    />
                    <button class="btn btn-primary btn-sm" @click="setDistributeAmount">Set Amount</button>
                </div>
            </label>

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-sm table-xs">
                    <thead>
                        <tr>
                            <th>Hero</th>
                            <th>Item</th>
                            <th class="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="h in heroes" :key="h.address">
                            <td>{{ h.playerState.name }}</td>
                            <td>
                                {{ getItemName(item) || "" }}
                            </td>
                            <td class="text-right">
                                <input
                                    type="number"
                                    dir="rtl"
                                    class="input input-bordered w-[100px] bg-base-100-50 input-sm"
                                    v-model="h.amountToDistribute"
                                    min="0"
                                    :max="
                                        bankItems.find(
                                            (i) => i.tokenId === item
                                        )?.amount || 0
                                    "
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="error" class="mt-5 text-error">
                {{ error }}
            </div>

            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="withdrawItems"
                :disabled="loading || heroes.length === 0 || item === 0"
            >
                Distribute {{ heroes.length }} Item{{
                    heroes.length === 1 ? "" : "s"
                }}
            </button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AssignedHeroGroupSelect from "../inputs/AssignedHeroGroupSelect.vue"
import { getItemName } from "../../store/items"
import { decodeTransaction, useFactoryStore } from "../../store/factory"
import { useAppStore } from "../../store/app"
import { actionChoiceNames, actionNames } from "../../store/skills"
import { AggregatedItem, ProxySilo } from "../../store/models/factory.models"
import { describeTxError } from "../../utils/errors"
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

const selectedHeroGroup = ref("")
const heroes = ref<HeroWithAmount[]>([])
const item = ref<number>(0)
const helperAmount = ref<number>(0)
const error = ref<string | null>(null)

const factoryStore = useFactoryStore()
const app = useAppStore()

interface HeroWithAmount extends ProxySilo {
    amountToDistribute: number
}

const loading = ref(false)
const bankItems = ref<AggregatedItem[]>([])

const openDialog = (b: AggregatedItem[]) => {
    bankItems.value = b.filter((i) => Number(i.amount) > 0)
    error.value = null
    heroes.value = []
    item.value = 0
    selectedHeroGroup.value = ""
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const onUpdateHeroGroup = (value: string) => {
    heroes.value = factoryStore.assignedProxys
        .filter(
            (h) =>
                decodeTransaction(h.savedTransactions) === value ||
                h.queuedActions
                    .map(
                        (a) =>
                            actionNames[Number(a.actionId)] ||
                            actionChoiceNames[Number(a.choice?.id)] ||
                            ""
                    )
                    .includes(value)
        )
        .map((h) => ({
            ...h,
            amountToDistribute: 1,
        }))
}

const withdrawItems = async () => {
    loading.value = true
    error.value = null
    try {
        await factoryStore.distributeItems(
            heroes.value
                .filter((i) => i.amountToDistribute > 0)
                .map((i) => ({
                    address: i.address,
                    tokenId: item.value,
                    amount: i.amountToDistribute.toString(),
                })),
            props.chainId as SonicChainId
        )
        app.addToast(`Items distributed`, "alert-success", 5000)
        emits("withdrawn")
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
    } catch (e: any) {
        if (e.message?.indexOf("User rejected the request") > -1) {
            return
        }
        console.error(
            "Distribute items failed:",
            describeTxError(e),
            e
        )
        error.value =
            "Could not create a transaction. Please check you're not distributing more items than you have."
    } finally {
        loading.value = false
    }
}

const setDistributeAmount = () => {
    heroes.value.forEach((h) => {
        h.amountToDistribute = helperAmount.value
    })
}

defineExpose({
    openDialog,
})
</script>
