<template>
    <dialog id="egg_hatching_modal" class="modal">
        <div
            class="modal-box bg-base-100 border-2 border-primary md:w-4/5 max-w-full"
        >
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
                            <th class="text-right">Pet Stats (Min - Max)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="a in actions"
                            :key="a.actionId"
                        >
                            <td class="text-left">
                                {{ vrfActionIdNames[a.actionId] }}
                            </td>
                            <td class="text-right cursor-pointer">
                                <span
                                    v-for="(r, i) in a.inputTokenIds"
                                    :key="r"
                                    class="text-xs flex justify-between"
                                    @click.prevent="
                                        itemStore.itemSearch = getItemName(
                                            r
                                        )
                                    "
                                    ><span></span
                                    >{{ a.inputAmounts[i] }}</span
                                >
                            </td>
                            <td class="text-right">
                                <div v-for="p in getPetStats(getDecodedData(a.data)?.[0])" class="text-xs flex justify-between">
                                    <span>{{ p.style }}</span>
                                    <span>
                                        {{ `(${p.min0Fixed} - ${p.max0Fixed})` }} + {{ `(${p.min0Percentage}% - ${p.max0Percentage}%)` }}
                                        <span v-if="p.min1Fixed > 0">
                                            {{ ` / (${p.min1Fixed} - ${p.max1Fixed})` }} + {{ `(${p.min1Percentage}% - ${p.max1Percentage}%)` }}
                                        </span>
                                    </span>
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
import {
    MEDIA_URL,
} from "../../store/core"
import { getItemName, useItemStore } from "../../store/items"
import { InstantVRFActionType, PetEnhancementType } from "@paintswap/estfor-definitions/types"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { useVRFActionsStore, vrfActionNames, vrfActionIdNames } from "../../store/vrfActions"
import { decodePetRange } from "../../utils/abi"
import { allBasePets } from "../../data/pets"

const actionType = ref(0)
const itemStore = useItemStore()
const vrfActionsStore = useVRFActionsStore()

const actions = computed(() => {
    const a = [...vrfActionsStore.egg]
    a.sort((a, b) => (a.actionId > b.actionId ? 1 : -1))
    return a.filter(
        (y) =>
            itemStore.itemSearch === "" ||
            y.inputTokenIds.some((z: number) => getItemName(z)?.toLowerCase().includes(itemStore.itemSearch.toLowerCase())) ||
            getDecodedData(y.data)?.some((z: { itemTokenId: number }) => 
                getItemName(z.itemTokenId)?.toLowerCase().includes(itemStore.itemSearch.toLowerCase())
            )
    )
})

const imgSource = computed(() => {
    // @ts-ignore
    return `${MEDIA_URL}/landscape/${vrfActionNames[
        actionType.value
    ].toLowerCase()}.jpg`
})

const skillName = computed(() => {
    // @ts-ignore
    return vrfActionNames[actionType.value]
})

const getDecodedData = (data: string) => {
    const petIds = decodePetRange(data)
    return [petIds.rewardBasePetIdMin, petIds.rewardBasePetIdMax]
}

const getPetStat = (baseId: number): { style: string, min0Fixed: number, max0Fixed: number, min0Percentage: number, max0Percentage: number, min1Fixed: number, max1Fixed: number, min1Percentage: number, max1Percentage: number } => {
    const pet = allBasePets.find((x) => x.baseId === baseId)
    let style = ""
    switch (pet?.enhancementType) {
        case PetEnhancementType.DEFENCE:
            style = "Defence"
            break
        case PetEnhancementType.RANGED:
        case PetEnhancementType.MELEE:
        case PetEnhancementType.MAGIC:
            style = "Attack"
            break
        case PetEnhancementType.MELEE_AND_DEFENCE:
        case PetEnhancementType.RANGED_AND_DEFENCE:
        case PetEnhancementType.MAGIC_AND_DEFENCE:
            style = "Dual Stat"
            break
        case PetEnhancementType.HEALTH:
            style = "Health"
            break
        default:
            style = "None"
    }

    return {
        style,
        min0Fixed: pet?.skillFixedMins[0],
        max0Fixed: pet?.skillFixedMaxs[0],
        min0Percentage: pet?.skillPercentageMins[0],
        max0Percentage: pet?.skillPercentageMaxs[0],
        min1Fixed: pet?.skillFixedMins[1],
        max1Fixed: pet?.skillFixedMaxs[1],
        min1Percentage: pet?.skillPercentageMins[1],
        max1Percentage: pet?.skillPercentageMaxs[1]
    }
}

const getPetStats = (tokenId: number): { style: string, min0Fixed: number, max0Fixed: number, min0Percentage: number, max0Percentage: number, min1Fixed: number, max1Fixed: number, min1Percentage: number, max1Percentage: number }[] => {
    switch (Number(tokenId)) {
        case EstforConstants.FROST_MIN_TIER1:
            return [getPetStat(EstforConstants.PET_FROST_MELEE_TIER1), getPetStat(EstforConstants.PET_FROST_MELEE_AND_DEFENCE_TIER1), getPetStat(EstforConstants.PET_FROST_DEFENCE_TIER1), getPetStat(EstforConstants.PET_FROST_HEALTH_TIER1) ]
        case EstforConstants.FROST_MIN_TIER2:
            return [getPetStat(EstforConstants.PET_FROST_MELEE_TIER2), getPetStat(EstforConstants.PET_FROST_MELEE_AND_DEFENCE_TIER2), getPetStat(EstforConstants.PET_FROST_DEFENCE_TIER2), getPetStat(EstforConstants.PET_FROST_HEALTH_TIER2) ]
        case EstforConstants.FROST_MIN_TIER3:
            return [getPetStat(EstforConstants.PET_FROST_MELEE_TIER3), getPetStat(EstforConstants.PET_FROST_MELEE_AND_DEFENCE_TIER3), getPetStat(EstforConstants.PET_FROST_DEFENCE_TIER3), getPetStat(EstforConstants.PET_FROST_HEALTH_TIER3) ]
        case EstforConstants.FROST_MIN_TIER4:
            return [getPetStat(EstforConstants.PET_FROST_MELEE_TIER4), getPetStat(EstforConstants.PET_FROST_MELEE_AND_DEFENCE_TIER4), getPetStat(EstforConstants.PET_FROST_DEFENCE_TIER4), getPetStat(EstforConstants.PET_FROST_HEALTH_TIER4) ]
        case EstforConstants.FROST_MIN_TIER5:
            return [getPetStat(EstforConstants.PET_FROST_MELEE_TIER5), getPetStat(EstforConstants.PET_FROST_MELEE_AND_DEFENCE_TIER5), getPetStat(EstforConstants.PET_FROST_DEFENCE_TIER5), getPetStat(EstforConstants.PET_FROST_HEALTH_TIER5) ]
        case EstforConstants.ONEKIN_MIN_TIER1:
            return [getPetStat(EstforConstants.PET_ONEKIN_MELEE_TIER1), getPetStat(EstforConstants.PET_ONEKIN_MELEE_AND_DEFENCE_TIER1), getPetStat(EstforConstants.PET_ONEKIN_DEFENCE_TIER1), getPetStat(EstforConstants.PET_ONEKIN_HEALTH_TIER1) ]
        case EstforConstants.ONEKIN_MIN_TIER2:
            return [getPetStat(EstforConstants.PET_ONEKIN_MELEE_TIER2), getPetStat(EstforConstants.PET_ONEKIN_MELEE_AND_DEFENCE_TIER2), getPetStat(EstforConstants.PET_ONEKIN_DEFENCE_TIER2), getPetStat(EstforConstants.PET_ONEKIN_HEALTH_TIER2) ]
        case EstforConstants.ONEKIN_MIN_TIER3:
            return [getPetStat(EstforConstants.PET_ONEKIN_MELEE_TIER3), getPetStat(EstforConstants.PET_ONEKIN_MELEE_AND_DEFENCE_TIER3), getPetStat(EstforConstants.PET_ONEKIN_DEFENCE_TIER3), getPetStat(EstforConstants.PET_ONEKIN_HEALTH_TIER3) ]
        case EstforConstants.ONEKIN_MIN_TIER4:
            return [getPetStat(EstforConstants.PET_ONEKIN_MELEE_TIER4), getPetStat(EstforConstants.PET_ONEKIN_MELEE_AND_DEFENCE_TIER4), getPetStat(EstforConstants.PET_ONEKIN_DEFENCE_TIER4), getPetStat(EstforConstants.PET_ONEKIN_HEALTH_TIER4) ]
        case EstforConstants.ONEKIN_MIN_TIER5:
            return [getPetStat(EstforConstants.PET_ONEKIN_MELEE_TIER5), getPetStat(EstforConstants.PET_ONEKIN_MELEE_AND_DEFENCE_TIER5), getPetStat(EstforConstants.PET_ONEKIN_DEFENCE_TIER5), getPetStat(EstforConstants.PET_ONEKIN_HEALTH_TIER5) ]
        case EstforConstants.OG_MIN_TIER1:
            return [getPetStat(EstforConstants.PET_OG_MELEE_TIER1), getPetStat(EstforConstants.PET_OG_MELEE_AND_DEFENCE_TIER1), getPetStat(EstforConstants.PET_OG_DEFENCE_TIER1), getPetStat(EstforConstants.PET_OG_HEALTH_TIER1) ]
        case EstforConstants.OG_MIN_TIER2:
            return [getPetStat(EstforConstants.PET_OG_MELEE_TIER2), getPetStat(EstforConstants.PET_OG_MELEE_AND_DEFENCE_TIER2), getPetStat(EstforConstants.PET_OG_DEFENCE_TIER2), getPetStat(EstforConstants.PET_OG_HEALTH_TIER2) ]
        case EstforConstants.OG_MIN_TIER3:
            return [getPetStat(EstforConstants.PET_OG_MELEE_TIER3), getPetStat(EstforConstants.PET_OG_MELEE_AND_DEFENCE_TIER3), getPetStat(EstforConstants.PET_OG_DEFENCE_TIER3), getPetStat(EstforConstants.PET_OG_HEALTH_TIER3) ]
        case EstforConstants.OG_MIN_TIER4:
            return [getPetStat(EstforConstants.PET_OG_MELEE_TIER4), getPetStat(EstforConstants.PET_OG_MELEE_AND_DEFENCE_TIER4), getPetStat(EstforConstants.PET_OG_DEFENCE_TIER4), getPetStat(EstforConstants.PET_OG_HEALTH_TIER4) ]
        case EstforConstants.OG_MIN_TIER5:
            return [getPetStat(EstforConstants.PET_OG_MELEE_TIER5), getPetStat(EstforConstants.PET_OG_MELEE_AND_DEFENCE_TIER5), getPetStat(EstforConstants.PET_OG_DEFENCE_TIER5), getPetStat(EstforConstants.PET_OG_HEALTH_TIER5) ]
        case EstforConstants.DEFAULT_MIN_TIER1:
            return [getPetStat(EstforConstants.PET_DEFAULT_MELEE_TIER1), getPetStat(EstforConstants.PET_DEFAULT_MELEE_AND_DEFENCE_TIER1), getPetStat(EstforConstants.PET_DEFAULT_DEFENCE_TIER1), getPetStat(EstforConstants.PET_DEFAULT_HEALTH_TIER1) ]
        case EstforConstants.DEFAULT_MIN_TIER2:
            return [getPetStat(EstforConstants.PET_DEFAULT_MELEE_TIER2), getPetStat(EstforConstants.PET_DEFAULT_MELEE_AND_DEFENCE_TIER2), getPetStat(EstforConstants.PET_DEFAULT_DEFENCE_TIER2), getPetStat(EstforConstants.PET_DEFAULT_HEALTH_TIER2) ]
        case EstforConstants.DEFAULT_MIN_TIER3:
            return [getPetStat(EstforConstants.PET_DEFAULT_MELEE_TIER3), getPetStat(EstforConstants.PET_DEFAULT_MELEE_AND_DEFENCE_TIER3), getPetStat(EstforConstants.PET_DEFAULT_DEFENCE_TIER3), getPetStat(EstforConstants.PET_DEFAULT_HEALTH_TIER3) ]
        case EstforConstants.DEFAULT_MIN_TIER4:
            return [getPetStat(EstforConstants.PET_DEFAULT_MELEE_TIER4), getPetStat(EstforConstants.PET_DEFAULT_MELEE_AND_DEFENCE_TIER4), getPetStat(EstforConstants.PET_DEFAULT_DEFENCE_TIER4), getPetStat(EstforConstants.PET_DEFAULT_HEALTH_TIER4) ]
        case EstforConstants.DEFAULT_MIN_TIER5:
            return [getPetStat(EstforConstants.PET_DEFAULT_MELEE_TIER5), getPetStat(EstforConstants.PET_DEFAULT_MELEE_AND_DEFENCE_TIER5), getPetStat(EstforConstants.PET_DEFAULT_DEFENCE_TIER5), getPetStat(EstforConstants.PET_DEFAULT_HEALTH_TIER5) ]
        case EstforConstants.CRYSTAL_MIN_TIER1:
            return [getPetStat(EstforConstants.PET_CRYSTAL_MELEE_TIER1), getPetStat(EstforConstants.PET_CRYSTAL_MELEE_AND_DEFENCE_TIER1), getPetStat(EstforConstants.PET_CRYSTAL_DEFENCE_TIER1), getPetStat(EstforConstants.PET_CRYSTAL_HEALTH_TIER1) ] 
        case EstforConstants.CRYSTAL_MIN_TIER2:
            return [getPetStat(EstforConstants.PET_CRYSTAL_MELEE_TIER2), getPetStat(EstforConstants.PET_CRYSTAL_MELEE_AND_DEFENCE_TIER2), getPetStat(EstforConstants.PET_CRYSTAL_DEFENCE_TIER2), getPetStat(EstforConstants.PET_CRYSTAL_HEALTH_TIER2) ] 
        case EstforConstants.CRYSTAL_MIN_TIER3:
            return [getPetStat(EstforConstants.PET_CRYSTAL_MELEE_TIER3), getPetStat(EstforConstants.PET_CRYSTAL_MELEE_AND_DEFENCE_TIER3), getPetStat(EstforConstants.PET_CRYSTAL_DEFENCE_TIER3), getPetStat(EstforConstants.PET_CRYSTAL_HEALTH_TIER3) ] 
        case EstforConstants.CRYSTAL_MIN_TIER4:
            return [getPetStat(EstforConstants.PET_CRYSTAL_MELEE_TIER4), getPetStat(EstforConstants.PET_CRYSTAL_MELEE_AND_DEFENCE_TIER4), getPetStat(EstforConstants.PET_CRYSTAL_DEFENCE_TIER4), getPetStat(EstforConstants.PET_CRYSTAL_HEALTH_TIER4) ] 
        case EstforConstants.CRYSTAL_MIN_TIER5:
            return [getPetStat(EstforConstants.PET_CRYSTAL_MELEE_TIER5), getPetStat(EstforConstants.PET_CRYSTAL_MELEE_AND_DEFENCE_TIER5), getPetStat(EstforConstants.PET_CRYSTAL_DEFENCE_TIER5), getPetStat(EstforConstants.PET_CRYSTAL_HEALTH_TIER5) ] 
        case EstforConstants.ANNIV1_MIN_TIER1:
            return [getPetStat(EstforConstants.PET_ANNIV1_MELEE_TIER1), getPetStat(EstforConstants.PET_ANNIV1_MELEE_AND_DEFENCE_TIER1), getPetStat(EstforConstants.PET_ANNIV1_DEFENCE_TIER1), getPetStat(EstforConstants.PET_ANNIV1_HEALTH_TIER1) ] 
        case EstforConstants.ANNIV1_MIN_TIER2:
            return [getPetStat(EstforConstants.PET_ANNIV1_MELEE_TIER2), getPetStat(EstforConstants.PET_ANNIV1_MELEE_AND_DEFENCE_TIER2), getPetStat(EstforConstants.PET_ANNIV1_DEFENCE_TIER2), getPetStat(EstforConstants.PET_ANNIV1_HEALTH_TIER2) ] 
        case EstforConstants.ANNIV1_MIN_TIER3:
            return [getPetStat(EstforConstants.PET_ANNIV1_MELEE_TIER3), getPetStat(EstforConstants.PET_ANNIV1_MELEE_AND_DEFENCE_TIER3), getPetStat(EstforConstants.PET_ANNIV1_DEFENCE_TIER3), getPetStat(EstforConstants.PET_ANNIV1_HEALTH_TIER3) ] 
        case EstforConstants.ANNIV1_MIN_TIER4:
            return [getPetStat(EstforConstants.PET_ANNIV1_MELEE_TIER4), getPetStat(EstforConstants.PET_ANNIV1_MELEE_AND_DEFENCE_TIER4), getPetStat(EstforConstants.PET_ANNIV1_DEFENCE_TIER4), getPetStat(EstforConstants.PET_ANNIV1_HEALTH_TIER4) ] 
        case EstforConstants.ANNIV1_MIN_TIER5:
            return [getPetStat(EstforConstants.PET_ANNIV1_MELEE_TIER5), getPetStat(EstforConstants.PET_ANNIV1_MELEE_AND_DEFENCE_TIER5), getPetStat(EstforConstants.PET_ANNIV1_DEFENCE_TIER5), getPetStat(EstforConstants.PET_ANNIV1_HEALTH_TIER5) ] 
        case EstforConstants.KRAGSTYR_MIN_TIER1:
            return [getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_TIER1), getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_AND_DEFENCE_TIER1), getPetStat(EstforConstants.PET_KRAGSTYR_DEFENCE_TIER1), getPetStat(EstforConstants.PET_KRAGSTYR_HEALTH_TIER1) ] 
        case EstforConstants.KRAGSTYR_MIN_TIER2:
            return [getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_TIER2), getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_AND_DEFENCE_TIER2), getPetStat(EstforConstants.PET_KRAGSTYR_DEFENCE_TIER2), getPetStat(EstforConstants.PET_KRAGSTYR_HEALTH_TIER2) ] 
        case EstforConstants.KRAGSTYR_MIN_TIER3:
            return [getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_TIER3), getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_AND_DEFENCE_TIER3), getPetStat(EstforConstants.PET_KRAGSTYR_DEFENCE_TIER3), getPetStat(EstforConstants.PET_KRAGSTYR_HEALTH_TIER3) ] 
        case EstforConstants.KRAGSTYR_MIN_TIER4:
            return [getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_TIER4), getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_AND_DEFENCE_TIER4), getPetStat(EstforConstants.PET_KRAGSTYR_DEFENCE_TIER4), getPetStat(EstforConstants.PET_KRAGSTYR_HEALTH_TIER4) ] 
        case EstforConstants.KRAGSTYR_MIN_TIER5:
            return [getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_TIER5), getPetStat(EstforConstants.PET_KRAGSTYR_MELEE_AND_DEFENCE_TIER5), getPetStat(EstforConstants.PET_KRAGSTYR_DEFENCE_TIER5), getPetStat(EstforConstants.PET_KRAGSTYR_HEALTH_TIER5) ] 
        default:
            return []
    }
}

const openDialog = (_actionType: InstantVRFActionType) => {
    actionType.value = _actionType
    const dialog = document.getElementById("egg_hatching_modal") as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog,
})
</script>
