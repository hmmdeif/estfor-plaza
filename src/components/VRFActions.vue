<template>
    <ItemSearch class="my-10 lg:hidden" />
    <template v-if="actionsWithItemSearch.length == 0">
        <div class="card bg-base-100-50 shadow-xl rounded-lg my-5">
            <div class="card-body text-center">
                No skills found that require or produce "{{ searchStore.itemSearch }}"
            </div>
        </div>
    </template>
    <div
        class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-5 my-2 md:my-10"
    >
        <template v-for="action in actionsWithItemSearch" :key="action.actionType">
            <div class="card bg-base-100-50 shadow-xl rounded-lg">
                <figure>
                    <picture>
                        <source
                            v-if="landscape(action.actionType)?.avif"
                            type="image/avif"
                            :srcset="landscape(action.actionType).avif"
                        />
                        <img
                            class="w-full cursor-pointer"
                            :src="landscape(action.actionType)?.webp"
                            :alt="vrfActionNamesTitles[action.actionType]"
                            @click.prevent="
                                action.actionType === InstantVRFActionType.EGG
                                    ? eggHatchingInfoRef?.openDialog(action.actionType)
                                    : vrfActionInfoRef?.openDialog(action.actionType)
                            "
                        />
                    </picture>
                </figure>
                <div class="card-body">
                    <div class="grid grid-cols-2 gap-2">
                        <div class="flex-col flex justify-between">
                            <div class="flex flex-col">
                                <div class="text-2xl font-bold flex items-center gap-2">
                                    {{ vrfActionNamesTitles[action.actionType] || "Unknown" }}
                                </div>

                                <div class="text-sm text-gray-400">
                                    {{ action.description }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
    <EggHatchingInfo ref="eggHatchingInfoRef" />
    <VrfActionInfo ref="vrfActionInfoRef" />
</template>

<script setup lang="ts">
import ItemSearch from "./ItemSearch.vue"
import { getItemName } from "../store/items"
import { useSearchStore } from "../store/search"
import { useVRFActionsStore, vrfActionNames } from "../store/vrfActions"
import { landscapeImage } from "../utils/media"
import { decodeItemRewards, decodePetRange } from "../utils/abi"
import { computed, ref } from "vue"
import { InstantVRFActionType } from "@paintswap/estfor-definitions/types"
import EggHatchingInfo from "./dialogs/EggHatchingInfo.vue"
import VrfActionInfo from "./dialogs/VRFActionInfo.vue"

const searchStore = useSearchStore()
const vrfActionsStore = useVRFActionsStore()
const eggHatchingInfoRef = ref<typeof EggHatchingInfo>()
const vrfActionInfoRef = ref<typeof VrfActionInfo>()

const allVrfActions = computed(() => {
    return [
        {
            actionType: InstantVRFActionType.FORGING,
            actions: vrfActionsStore.forging,
            description: "Reforging fragments",
        },
        {
            actionType: InstantVRFActionType.GENERIC,
            actions: vrfActionsStore.generic,
            description: "Opening locked chests and harvesting seeds",
        },
        {
            actionType: InstantVRFActionType.EGG,
            actions: vrfActionsStore.egg,
            description: "Egg hatching",
        },
    ]
})

const vrfActionNamesTitles = computed(() => {
    return {
        [InstantVRFActionType.FORGING]: "Forging",
        [InstantVRFActionType.GENERIC]: "Thieving / Farming",
        [InstantVRFActionType.EGG]: "Pets",
        [InstantVRFActionType.NONE]: "Unknown",
    }
})

const isEggAction = (actionType: number) => actionType === InstantVRFActionType.EGG

const landscape = (actionType: InstantVRFActionType) => {
    return landscapeImage(String(vrfActionNames[actionType] ?? ""))
}

const actionsWithItemSearch = computed(() => {
    return allVrfActions.value.filter((x) =>
        x.actions.some(
            (y) =>
                y.inputTokenIds.some((z: number) =>
                    getItemName(z)?.toLowerCase().includes(searchStore.itemSearch.toLowerCase())
                ) ||
                (isEggAction(x.actionType)
                    ? [
                          decodePetRange(y.data).rewardBasePetIdMin,
                          decodePetRange(y.data).rewardBasePetIdMax,
                      ]
                    : decodeItemRewards(y.data)
                )?.some((z: { itemTokenId: number }) =>
                    getItemName(z.itemTokenId)
                        ?.toLowerCase()
                        .includes(searchStore.itemSearch.toLowerCase())
                )
        )
    )
})
</script>
