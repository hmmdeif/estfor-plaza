<template>
    <dialog id="vrf_action_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary md:w-4/5 max-w-full">
            <h3 class="font-bold text-lg text-center">{{ skillName }}</h3>
            <img
                :src="imgSource"
                :alt="skillName"
                class="w-full mx-auto mt-5 max-w-[800px] rounded-lg"
            />

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="text-left">Action</th>
                            <th class="text-right">Inputs</th>
                            <th class="text-right">
                                Rewards
                                <span v-if="actionType === InstantVRFActionType.FORGING">
                                    (One reward per action - highest roll)</span
                                >
                                <span v-if="actionType === InstantVRFActionType.GENERIC">
                                    (One reward per action - highest roll)</span
                                >
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="a in actions" :key="a.actionId">
                            <td class="text-left">
                                {{ vrfActionIdNames[a.actionId] }}
                            </td>
                            <td class="text-right cursor-pointer">
                                <span
                                    v-for="(r, i) in a.inputTokenIds"
                                    :key="r"
                                    class="text-xs flex justify-between"
                                    @click.prevent="searchStore.itemSearch = getItemName(r)"
                                    ><span>{{ getItemName(r) }}</span
                                    >{{ a.inputAmounts[i] }}</span
                                >
                            </td>
                            <td class="text-right cursor-pointer">
                                <div
                                    v-for="r in getDecodedData(a.data)"
                                    :key="r.itemTokenId"
                                    class="text-xs flex justify-between"
                                    @click.prevent="
                                        searchStore.itemSearch = getItemName(Number(r.itemTokenId))
                                    "
                                >
                                    <span>{{ getItemName(Number(r.itemTokenId)) }}</span
                                    ><span
                                        >{{ r.amount }} ({{
                                            Number(calculateChance(r)).toFixed(2)
                                        }}%)</span
                                    >
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { MEDIA_URL } from "../../store/core"
import { getItemName } from "../../store/items"
import { useSearchStore } from "../../store/search"
import {
    InstantVRFActionType,
    InstantVRFActionInput,
    RandomReward,
} from "@paintswap/estfor-definitions/types"
import { useVRFActionsStore, vrfActionNames, vrfActionIdNames } from "../../store/vrfActions"
import { decodeItemRewards } from "../../utils/abi"

const actionType = ref(0)
const searchStore = useSearchStore()
const vrfActionsStore = useVRFActionsStore()

const calculateChance = (r: RandomReward) => {
    return (Number(r.chance) * 100) / 65535
}

const actions = computed(() => {
    let a: InstantVRFActionInput[] = []
    if (actionType.value === InstantVRFActionType.FORGING) {
        a = vrfActionsStore.forging
    }
    if (actionType.value === InstantVRFActionType.GENERIC) {
        a = vrfActionsStore.generic
    }
    a.sort((a, b) => (a.actionId > b.actionId ? 1 : -1))
    return a.filter(
        (y) =>
            searchStore.itemSearch === "" ||
            y.inputTokenIds.some((z: number) =>
                getItemName(z)?.toLowerCase().includes(searchStore.itemSearch.toLowerCase())
            ) ||
            getDecodedData(y.data)?.some((z: { itemTokenId: number }) =>
                getItemName(z.itemTokenId)
                    ?.toLowerCase()
                    .includes(searchStore.itemSearch.toLowerCase())
            )
    )
})

const imgSource = computed(() => {
    // @ts-ignore
    return `${MEDIA_URL}/landscape/${vrfActionNames[actionType.value].toLowerCase()}.jpg`
})

const skillName = computed(() => {
    // @ts-ignore
    return vrfActionNames[actionType.value]
})

const getDecodedData = (data: string) => {
    return decodeItemRewards(data)
}

const openDialog = (_actionType: InstantVRFActionType) => {
    actionType.value = _actionType
    const dialog = document.getElementById("vrf_action_modal") as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog,
})
</script>
