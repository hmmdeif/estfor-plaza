<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <div role="tablist" class="tabs tabs-border tabs-lg mb-4">
                <div role="tab" class="tab tab-active text-sm md:text-md">
                    Territory Rankings
                </div>
                <router-link
                    to="/vault-rankings"
                    role="tab"
                    class="tab text-sm md:text-md"
                    >Vault Rankings</router-link
                >
            </div>
            <div class="overflow-x-auto">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th>Owner</th>
                            <th class="text-right">Emissions</th>
                            <th class="text-right">Unclaimed Emissions</th>
                            <th class="text-right">Chance to Claim</th>
                        </tr>
                    </thead>

                    <tbody
                        v-if="loading"
                        class="mx-auto my-[100px] w-full text-center"
                    >
                        <tr>
                            <td colspan="4">
                                <span
                                    class="loading loading-spinner text-primary loading-md mx-auto"
                                ></span>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr
                            v-for="territory in sortedTerritories"
                            :key="territory.id"
                            :class="{
                                'text-success':
                                    territory.owner ==
                                    coreStore.clanState?.name,
                                'text-warning': territory.owner == 'Unclaimed',
                            }"
                        >
                            <td>{{ territory.owner }}</td>
                            <td class="text-right">
                                {{ territory.percentageEmissions / 10 }}%
                            </td>
                            <td class="text-right">
                                {{
                                    BigInt(territory.unclaimedEmissions) /
                                    BigInt(10 ** 18)
                                }}
                            </td>
                            <td class="text-right">
                                {{
                                    territory.owner == coreStore.clanState?.name
                                        ? "-"
                                        : territory.chanceToWin
                                          ? `${territory.chanceToWin}%`
                                          : "You are not in a clan"
                                }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="text-xs text-center text-warning">
                N.B. This page may take a small time to load whilst it
                calculates the chance to win
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useClanStore, calculateBattleChances } from "../store/clan"
import { useCoreStore } from "../store/core"

const clanStore = useClanStore()
const coreStore = useCoreStore()
const sortedTerritories = ref<any[]>([])

const attackerTerritoryCombatants = computed(() => {
    return coreStore.clanState?.territoryCombatants || []
})

const loading = ref(false)

const init = async () => {
    loading.value = true
    try {
        await clanStore.getAllClanInfo()

        sortedTerritories.value = [...clanStore.sortedTerritories]
        if (attackerTerritoryCombatants.value.length > 0) {
            for (const territory of sortedTerritories.value) {
                territory.chanceToWin = calculateBattleChances(
                    500,
                    attackerTerritoryCombatants.value,
                    territory.combatants,
                    false,
                    "Territory"
                ).clanA
            }
        } else {
            for (const territory of sortedTerritories.value) {
                territory.chanceToWin = null
            }
        }
    } finally {
        loading.value = false
    }
}

onMounted(init)
</script>
