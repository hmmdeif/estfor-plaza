<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg">
        <div class="card-body">
            <div class="overflow-x-auto">
                <table class="table md:table-sm table-xs">
                    <!-- head -->
                    <thead>
                        <tr>
                            <th class="w-20">
                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm"
                                    @click.prevent="
                                        !broochStore.hasAccess(0)
                                            ? emeraldBroochPaywallRef?.openDialog()
                                            : changeHeroStatsRef?.openDialog()
                                    "
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-6 h-6"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                                        />
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                        />
                                    </svg>
                                </button>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Melee"
                                >
                                    <img
                                        src="/src/assets/optimized/melee-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Melee"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Ranged"
                                >
                                    <img
                                        src="/src/assets/optimized/ranged-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Ranged"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Magic"
                                >
                                    <img
                                        src="/src/assets/optimized/magic-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Magic"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Melee Defence"
                                >
                                    <img
                                        src="/src/assets/optimized/melee_def-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Melee Defence"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Ranged Defence"
                                >
                                    <img
                                        src="/src/assets/optimized/ranged_def-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Ranged Defence"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Magic Defence"
                                >
                                    <img
                                        src="/src/assets/optimized/magic_def-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Magic Defence"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Health"
                                >
                                    <img
                                        src="/src/assets/optimized/health-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Health"
                                    />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- row 1 -->
                        <tr>
                            <th>Hero</th>
                            <td class="text-center">
                                {{ getLevel(coreStore.playerState?.meleeXP) }}
                            </td>
                            <td class="text-center">
                                {{ getLevel(coreStore.playerState?.rangedXP) }}
                            </td>
                            <td class="text-center">
                                {{ getLevel(coreStore.playerState?.magicXP) }}
                            </td>
                            <td class="text-center">
                                {{ getLevel(coreStore.playerState?.defenceXP) }}
                            </td>
                            <td class="text-center">
                                {{ getLevel(coreStore.playerState?.defenceXP) }}
                            </td>
                            <td class="text-center">
                                {{ getLevel(coreStore.playerState?.defenceXP) }}
                            </td>
                            <td class="text-center">
                                {{ getLevel(coreStore.playerState?.healthXP) }}
                            </td>
                        </tr>
                        <!-- row 2 -->
                        <tr>
                            <th>Equipment</th>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getAggregatedCombatStats
                                            .meleeAttack < 0,
                                }"
                            >
                                {{
                                    itemStore.getAggregatedCombatStats
                                        .meleeAttack
                                }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getAggregatedCombatStats
                                            .rangedAttack < 0,
                                }"
                            >
                                {{
                                    itemStore.getAggregatedCombatStats
                                        .rangedAttack
                                }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getAggregatedCombatStats
                                            .magicAttack < 0,
                                }"
                            >
                                {{
                                    itemStore.getAggregatedCombatStats
                                        .magicAttack
                                }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getAggregatedCombatStats
                                            .meleeDefence < 0,
                                }"
                            >
                                {{
                                    itemStore.getAggregatedCombatStats
                                        .meleeDefence
                                }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getAggregatedCombatStats
                                            .rangedDefence < 0,
                                }"
                            >
                                {{
                                    itemStore.getAggregatedCombatStats
                                        .rangedDefence
                                }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getAggregatedCombatStats
                                            .magicDefence < 0,
                                }"
                            >
                                {{
                                    itemStore.getAggregatedCombatStats
                                        .magicDefence
                                }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getAggregatedCombatStats
                                            .health < 0,
                                }"
                            >
                                {{ itemStore.getAggregatedCombatStats.health }}
                            </td>
                        </tr>
                        <!-- row 3 -->
                        <tr>
                            <th>Total</th>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getTotalCombatStats
                                            .meleeAttack < 0,
                                }"
                            >
                                {{ itemStore.getTotalCombatStats.meleeAttack }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getTotalCombatStats
                                            .rangedAttack < 0,
                                }"
                            >
                                {{ itemStore.getTotalCombatStats.rangedAttack }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getTotalCombatStats
                                            .magicAttack < 0,
                                }"
                            >
                                {{ itemStore.getTotalCombatStats.magicAttack }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getTotalCombatStats
                                            .meleeDefence < 0,
                                }"
                            >
                                {{ itemStore.getTotalCombatStats.meleeDefence }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getTotalCombatStats
                                            .rangedDefence < 0,
                                }"
                            >
                                {{
                                    itemStore.getTotalCombatStats.rangedDefence
                                }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getTotalCombatStats
                                            .magicDefence < 0,
                                }"
                            >
                                {{ itemStore.getTotalCombatStats.magicDefence }}
                            </td>
                            <td
                                class="text-center"
                                :class="{
                                    'text-error':
                                        itemStore.getTotalCombatStats.health <
                                        0,
                                }"
                            >
                                {{ itemStore.getTotalCombatStats.health }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <ChangeHeroStats
        ref="changeHeroStatsRef"
        :id="`${props.id}_change_hero_stats_modal`"
    />
    <EmeraldBroochPaywall
        ref="emeraldBroochPaywallRef"
        :id="`${props.id}_emerald_paywall_modal`"
    />
</template>

<script setup lang="ts">
import { useItemStore } from "../store/items"
import { useCoreStore, getLevel } from "../store/core"
import ChangeHeroStats from "./dialogs/ChangeHeroStats.vue"
import EmeraldBroochPaywall from "./dialogs/EmeraldBroochPaywall.vue"
import { ref } from "vue"
import { useBroochStore } from "../store/brooch"

const itemStore = useItemStore()
const coreStore = useCoreStore()
const broochStore = useBroochStore()

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const changeHeroStatsRef = ref<typeof ChangeHeroStats>()
const emeraldBroochPaywallRef = ref<typeof EmeraldBroochPaywall>()
</script>

<style scoped>
.table {
    table-layout: fixed;
}
</style>
