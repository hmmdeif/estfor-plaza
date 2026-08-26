<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg my-2 md:mt-10">
        <div class="card-body">
            <div
                v-if="!props.hideNonCombat"
                class="flex-wrap flex gap-5 justify-evenly"
            >
                <div
                    v-if="coreStore.globalBoostData.isNonCombatActive"
                    class="flex items-center gap-5"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 flex-none"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                        />
                    </svg>
                    <div class="grow flex-col">
                        <div class="text-2xl font-bold">
                            Global non-combat boost is active
                        </div>
                        <div class="text-sm text-gray-400">
                            For {{ hoursUntilGlobalBoostEnd.toFixed(0) }} more
                            hour{{
                                Math.round(hoursUntilGlobalBoostEnd) > 1
                                    ? "s"
                                    : ""
                            }}
                            (+{{ coreStore.globalBoostData.value }}% XP)
                        </div>
                    </div>
                </div>
                <div
                    v-if="coreStore.clanBoostData.isNonCombatActive"
                    class="flex items-center gap-5"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 flex-none"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                        />
                    </svg>
                    <div class="grow flex-col">
                        <div class="text-2xl font-bold">
                            Clan non-combat boost is active
                        </div>
                        <div class="text-sm text-gray-400">
                            For {{ hoursUntilClanBoostEnd.toFixed(0) }} more
                            hour{{
                                Math.round(hoursUntilClanBoostEnd) > 1
                                    ? "s"
                                    : ""
                            }}
                            (+{{ coreStore.clanBoostData.value }}% XP)
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="!props.hideCombat"
                class="flex-wrap flex gap-5 justify-evenly"
            >
                <div
                    v-if="coreStore.globalBoostData.isCombatActive"
                    class="flex items-center gap-5"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 flex-none"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                        />
                    </svg>
                    <div class="grow flex-col">
                        <div class="text-2xl font-bold">
                            Global combat boost is active
                        </div>
                        <div class="text-sm text-gray-400">
                            For {{ hoursUntilGlobalBoostEnd.toFixed(0) }} more
                            hour{{
                                Math.round(hoursUntilGlobalBoostEnd) > 1
                                    ? "s"
                                    : ""
                            }}
                            (+{{ coreStore.globalBoostData.value }}% XP)
                        </div>
                    </div>
                </div>
                <div
                    v-if="coreStore.clanBoostData.isCombatActive"
                    class="flex items-center gap-5"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 flex-none"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                        />
                    </svg>
                    <div class="grow flex-col">
                        <div class="text-2xl font-bold">
                            Clan combat boost is active
                        </div>
                        <div class="text-sm text-gray-400">
                            For {{ hoursUntilClanBoostEnd.toFixed(0) }} more
                            hour{{
                                Math.round(hoursUntilClanBoostEnd) > 1
                                    ? "s"
                                    : ""
                            }}
                            (+{{ coreStore.clanBoostData.value }}% XP)
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-wrap items-center justify-evenly">
                <select
                    class="select select-bordered select-xs"
                    v-model="individualBoost"
                    @update:model-value="onUpdateBoostVial"
                >
                    <option select :value="null">No boost vial</option>
                    <option
                        v-for="b in boostOptions"
                        :key="b.tokenId"
                        :value="b.tokenId"
                    >
                        {{ getItemName(b.tokenId) }} (+{{ getBoostValue(b) }}
                        {{ b.boostType === BoostType.COMBAT_FIXED ? "" : "%" }}
                        {{ boostTypeNames[b.boostType] }})
                    </option>
                </select>
                <div class="form-control items-end">
                    <label class="label cursor-pointer">
                        <span class="text-xs mr-2 items-center flex">
                            Wishing Well (+{{ wishingWellBoost.boostValue }}%
                            {{ boostTypeNames[wishingWellBoost.boostType] }})
                            <div
                                class="tooltip tooltip-primary tooltip-bottom ml-2"
                                :data-tip="
                                    'Wishing well boost lasts for ' +
                                    wishingWellBoost.boostDuration / 60 / 60 +
                                    ' hours and this is included in the calculations'
                                "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="w-5 h-5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                    />
                                </svg>
                            </div>
                        </span>
                        <input
                            type="checkbox"
                            class="checkbox checkbox-primary"
                            v-model="applyWishingWellBoost"
                            @update:model-value="onUpdateWishingWellBoost"
                        />
                    </label>
                </div>
                <div class="form-control items-end">
                    <label class="label cursor-pointer">
                        <span class="text-xs mr-2"
                            >Apply boosts</span
                        >
                        <input
                            type="checkbox"
                            class="checkbox checkbox-primary"
                            v-model="applyBoost"
                            @update:model-value="onUpdateApplyBoost"
                        />
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue"
import { useCoreStore, boostTypeNames } from "../store/core"
import { getHoursBetweenDates } from "../utils/time"
import { getItemName, useItemStore } from "../store/items"
import {
    BoostType,
    EquipPosition,
    ItemInput,
} from "@paintswap/estfor-definitions/types"
import { EstforConstants } from "@paintswap/estfor-definitions"

const coreStore = useCoreStore()
const itemStore = useItemStore()

const props = defineProps({
    hideCombat: {
        type: Boolean,
        default: false,
    },
    hideNonCombat: {
        type: Boolean,
        default: false,
    },
})

const applyBoost = ref(coreStore.applyBoost)
const individualBoost = ref(coreStore.individualBoost)
const applyWishingWellBoost = ref(coreStore.applyWishingWellBoost)

const onUpdateApplyBoost = async () => {
    await nextTick()
    coreStore.applyBoost = applyBoost.value
}

const onUpdateWishingWellBoost = async () => {
    await nextTick()
    coreStore.applyWishingWellBoost = applyWishingWellBoost.value
}

const onUpdateBoostVial = async () => {
    await nextTick()
    coreStore.individualBoost = individualBoost.value
}

const hoursUntilGlobalBoostEnd = computed(() => {
    return getHoursBetweenDates(
        coreStore.globalBoostData.endDateTime,
        new Date()
    )
})

const hoursUntilClanBoostEnd = computed(() => {
    return getHoursBetweenDates(coreStore.clanBoostData.endDateTime, new Date())
})

const boostOptions = computed(() => {
    return itemStore.items
        .filter((x) => x.equipPosition === EquipPosition.BOOST_VIAL)
        .filter(
            (x) => x.boostValue > 0 || x.boostType === BoostType.COMBAT_FIXED
        )
        .filter((x) => x.isAvailable)
})

const getBoostValue = (b: ItemInput) => {
    if (b.boostType === BoostType.COMBAT_FIXED) {
        return (
            b.combatStats.meleeAttack ||
            b.combatStats.magicAttack ||
            b.combatStats.rangedAttack ||
            b.combatStats.meleeDefence ||
            b.combatStats.magicDefence ||
            b.combatStats.rangedDefence ||
            b.combatStats.health
        )
    }
    return b.boostValue
}

const wishingWellBoost = computed(() => {
    return (
        itemStore.items.find(
            (x) => x.tokenId === EstforConstants.LUCK_OF_THE_DRAW
        ) || { boostType: BoostType.ANY_XP, boostValue: 0, boostDuration: 0 }
    )
})
</script>
