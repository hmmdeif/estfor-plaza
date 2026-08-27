<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg">
        <div class="card-body">
            <div class="overflow-x-auto">
                <table class="table md:table-sm table-xs">
                    <thead>
                        <tr>
                            <th class="flex max-md:flex-col">
                                <HourSelect v-model="elapsedTime" class="md:w-1/2 mr-2" />
                                <CombatStyleSelect
                                    v-model="combatStyle"
                                    :skill="weaponSkill"
                                    class="md:w-1/2"
                                />
                            </th>
                            <th class="text-right">
                                <div class="flex gap-1 items-center justify-end">
                                    Damage Dealt Per Minute
                                    <ChevronUpDownIcon
                                        v-if="currentSort != 'damagePerMinute'"
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort('damagePerMinute', 'desc')"
                                    />
                                    <ChevronDownIcon
                                        v-else-if="
                                            currentSort == 'damagePerMinute' &&
                                            currentDirection == 'desc'
                                        "
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort('damagePerMinute', 'asc')"
                                    />
                                    <ChevronUpIcon
                                        v-else
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort(null, 'desc')"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div class="flex gap-1 items-center justify-end">
                                    Damage Taken Over {{ elapsedTime }} Hour{{
                                        elapsedTime > 1 ? "s" : ""
                                    }}
                                    <ChevronUpDownIcon
                                        v-if="currentSort != 'damageTakenPerHour'"
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort('damageTakenPerHour', 'desc')"
                                    />
                                    <ChevronDownIcon
                                        v-else-if="
                                            currentSort == 'damageTakenPerHour' &&
                                            currentDirection == 'desc'
                                        "
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort('damageTakenPerHour', 'asc')"
                                    />
                                    <ChevronUpIcon
                                        v-else
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort(null, 'desc')"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div class="flex gap-1 items-center justify-end">
                                    XP Per Hour
                                    <ChevronUpDownIcon
                                        v-if="currentSort != 'xpPerHour'"
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort('xpPerHour', 'desc')"
                                    />
                                    <ChevronDownIcon
                                        v-else-if="
                                            currentSort == 'xpPerHour' && currentDirection == 'desc'
                                        "
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort('xpPerHour', 'asc')"
                                    />
                                    <ChevronUpIcon
                                        v-else
                                        class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                        @click="updateSort(null, 'desc')"
                                    />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="monsterRankings.length === 0">
                            <td colspan="4" class="text-center">
                                No monsters found that drop "{{ searchStore.itemSearch }}"
                            </td>
                        </tr>
                        <tr v-for="m in monsterRankings" :key="m.name">
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="avatar">
                                        <div
                                            class="mask mask-square rounded-lg w-12 h-12 cursor-pointer"
                                        >
                                            <img
                                                :src="m.imgSource"
                                                :alt="m.name"
                                                @click.prevent="
                                                    monsterInfoRef?.openDialog(m.actionId)
                                                "
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            class="font-bold cursor-pointer"
                                            @click.prevent="monsterInfoRef?.openDialog(m.actionId)"
                                        >
                                            {{ m.name }}
                                        </div>
                                        <div class="text-xs flex gap-2 items-center max-md:hidden">
                                            <div
                                                class="tooltip tooltip-primary tooltip-right"
                                                :data-tip="
                                                    m.meleeDamagePerMinute.toString() +
                                                    ' Melee Damage Per Minute'
                                                "
                                            >
                                                <img
                                                    src="/src/assets/optimized/melee-80.webp"
                                                    class="mask mask-squircle w-6"
                                                    alt="Melee"
                                                />
                                            </div>
                                            {{ m.meleeDamagePerMinute }}
                                            <div
                                                class="tooltip tooltip-primary tooltip-right"
                                                :data-tip="
                                                    m.rangedDamagePerMinute.toString() +
                                                    ' Ranged Damage Per Minute'
                                                "
                                            >
                                                <img
                                                    src="/src/assets/optimized/ranged-80.webp"
                                                    class="mask mask-squircle w-6"
                                                    alt="Ranged"
                                                />
                                            </div>
                                            {{ m.rangedDamagePerMinute }}
                                            <div
                                                class="tooltip tooltip-primary tooltip-right"
                                                :data-tip="
                                                    m.magicDamagePerMinute.toString() +
                                                    ' Magic Damage Per Minute'
                                                "
                                            >
                                                <img
                                                    src="/src/assets/optimized/magic-80.webp"
                                                    class="mask mask-squircle w-6"
                                                    alt="Magic"
                                                />
                                            </div>
                                            {{ m.magicDamagePerMinute }}
                                            <div
                                                class="tooltip tooltip-primary tooltip-right"
                                                :data-tip="m.combatStats.health + ' Total Health'"
                                            >
                                                <img
                                                    src="/src/assets/optimized/health-80.webp"
                                                    class="mask mask-squircle w-6"
                                                    alt="Health"
                                                />
                                            </div>
                                            {{ m.combatStats.health }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-right">
                                <div>
                                    <div>{{ m.damagePerMinute }}</div>
                                    <div class="text-xs max-md:hidden text-gray-300">
                                        {{ (m.combatStats.health / m.damagePerMinute).toFixed(2) }}
                                        minutes to kill
                                    </div>
                                </div>
                            </td>
                            <td class="text-right">
                                <div>
                                    <div>
                                        {{ m.damageTakenPerHour.toFixed(0) }}
                                    </div>
                                    <div class="text-xs max-md:hidden text-gray-300">
                                        <span
                                            v-if="
                                                m.fishRequiredPerHour > 0 &&
                                                m.fishRequiredPerHour !== Infinity
                                            "
                                            >{{ m.fishRequiredPerHour }}
                                            {{ equippedFishName }}</span
                                        >
                                        <span
                                            v-else-if="m.fishRequiredPerHour === Infinity"
                                            class="text-error"
                                            >Hero will die (equip food)</span
                                        >
                                        <span v-else class="text-success"
                                            >Hero health > Damage received</span
                                        >
                                    </div>
                                </div>
                            </td>
                            <td class="text-right">
                                <div>
                                    <div>
                                        {{
                                            (
                                                m.xpPerHour *
                                                coreStore.getXPBoostMultiplier(
                                                    combatStyle,
                                                    BoostType.COMBAT_XP
                                                )
                                            ).toFixed(0)
                                        }}
                                    </div>
                                    <div class="text-xs max-md:hidden text-gray-300">
                                        {{ levelsGained(currentXPForCombatStyle, m.xpPerHour) }}
                                        level{{
                                            levelsGained(currentXPForCombatStyle, m.xpPerHour) === 1
                                                ? ""
                                                : "s"
                                        }}
                                        gained
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <MonsterInfo ref="monsterInfoRef" />
</template>

<script setup lang="ts">
import { useMonsterStore } from "../store/monsters"
import { computed, ref, watch } from "vue"
import { ChevronUpDownIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/solid"
import { getItemName, useItemStore } from "../store/items"
import { useSearchStore } from "../store/search"
import { getLevel, useCoreStore } from "../store/core"
import HourSelect from "./inputs/HourSelect.vue"
import CombatStyleSelect from "./inputs/CombatStyleSelect.vue"
import { BoostType, Skill } from "@paintswap/estfor-definitions/types"
import MonsterInfo from "./dialogs/MonsterInfo.vue"

const itemStore = useItemStore()
const searchStore = useSearchStore()
const monsterStore = useMonsterStore()
const coreStore = useCoreStore()

const elapsedTime = ref(1)
const combatStyle = ref(Skill.DEFENCE)
const monsterInfoRef = ref<typeof MonsterInfo>()

const weaponSkill = computed(() => {
    const weapon = itemStore.items.find(
        (x) => x.tokenId === itemStore.getCurrentEquippedItems?.rightHand
    )
    if (weapon) {
        return weapon.skill
    }
    return Skill.NONE
})

watch(
    () => itemStore.getCurrentEquippedItems?.rightHand,
    () => {
        combatStyle.value = weaponSkill.value
    }
)

const currentXPForCombatStyle = computed(() => {
    let xp = "0"
    switch (combatStyle.value) {
        case Skill.MELEE:
            xp = coreStore.playerState.meleeXP
            break
        case Skill.RANGED:
            xp = coreStore.playerState.rangedXP
            break
        case Skill.MAGIC:
            xp = coreStore.playerState.magicXP
            break
        case Skill.DEFENCE:
            xp = coreStore.playerState.defenceXP
            break
        default:
            xp = "0"
    }
    // @ts-ignore - parseInt is fine here
    return parseInt(xp, 10)
})

const monsterRankings = computed(() => {
    const storeRankings = [...monsterStore.getMonsterRankings(elapsedTime.value)]
    if (currentSort.value) {
        storeRankings.sort((a, b) => {
            if (currentDirection.value == "desc") {
                // @ts-ignore
                return b[currentSort.value] > a[currentSort.value] ? 1 : -1
            } else {
                // @ts-ignore
                return a[currentSort.value] > b[currentSort.value] ? 1 : -1
            }
        })
    }
    return storeRankings.filter(
        (x) =>
            searchStore.itemSearch === "" ||
            x.guaranteedRewards.some((y) =>
                getItemName(y.itemTokenId)
                    ?.toLowerCase()
                    .includes(searchStore.itemSearch.toLowerCase())
            ) ||
            x.randomRewards.some((y) =>
                getItemName(y.itemTokenId)
                    ?.toLowerCase()
                    .includes(searchStore.itemSearch.toLowerCase())
            )
    )
})

const equippedFishName = computed(
    () => itemStore.items.find((x) => x.tokenId === itemStore.getCurrentEquippedItems?.food)?.name
)

const currentSort = ref<string | null>(null)
const currentDirection = ref("desc")

const updateSort = (sort: string | null, direction: string) => {
    currentSort.value = sort
    currentDirection.value = direction
}

const levelsGained = (currentXP: number, xpPerHour: number) => {
    return (
        getLevel(
            (
                currentXP +
                xpPerHour *
                    coreStore.getXPBoostMultiplier(combatStyle.value, BoostType.COMBAT_XP) *
                    elapsedTime.value
            ).toString()
        ) - getLevel(currentXP.toString())
    )
}
</script>
