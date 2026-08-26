<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 mx-auto md:w-[760px]"
    >
        <div class="card-body">
            <h3 class="font-bold text-lg text-center">Clan Battle Simulator</h3>
            <p class="mt-5">
                Select the clans and their members to simulate multiple battles
                for a territory and find out your chances to win.
            </p>
            <p class="mt-5">Rules of battle:</p>
            <ol class="list-decimal list-inside text-justify">
                <li>Clans post a maximum of 20 members to a battle</li>
                <li>
                    If one clan has more members in a battle, the extra members
                    will auto-win their fight
                </li>
                <li>
                    Clan members fight a single member from the opposing clan in
                    a random skill
                </li>
                <li>
                    Clan members get 1 point (2 points if evolved) plus an
                    additional point for every 20 levels in that skill
                </li>
                <!-- <li>Highest number rolled on all dice is the winner</li> -->
                <li>
                    Random byte array is rolled for each member (e.g. 0, 1, 1,
                    0, 1, 0, 0, 1) and the points equate to the number of bits
                    you get from the byte. For example, if you have 2 points you
                    get 2 numbers from right to left (resulting in a score of
                    1). If you have 4 points you get 4 numbers from right to
                    left (resulting in a score of 2 in the example byte).
                    Highest score wins
                </li>
                <li>
                    If the attackers obtain the most wins or the overall result
                    is a draw they capture the territory, or steal from the
                    locked vault (if the defender wins, then nothing happens)
                </li>
            </ol>
            <div class="flex justify-start mt-5">
                <label class="form-control w-full">
                    <div class="label">
                        <span class="text-sm">Simulations</span>
                    </div>
                    <input
                        type="number"
                        step="1000"
                        min="1"
                        max="100000"
                        class="input input-sm input-bordered bg-base-100-50"
                        v-model="simulationCount"
                    />
                    <div class="label justify-between">
                        <span></span>
                        <span class="text-xs text-base-content/60"
                            >Increase for accuracy, takes longer</span
                        >
                    </div>
                </label>
            </div>
            <div class="flex justify-end items-center">
                <div class="me-2">Battle Arena</div>
                <select
                    class="select select-bordered select-sm"
                    v-model="battleArena"
                >
                    <option value="Territory">Territory</option>
                    <option value="Vault">Vault</option>
                </select>
            </div>
            <div class="form-control items-end">
                <label class="label w-full cursor-pointer justify-between">
                    <span class="text-sm mr-2 items-center flex">
                        Use Sharpened Claw (+1 to max points for VAULT attacker)
                    </span>
                    <input
                        type="checkbox"
                        class="checkbox checkbox-primary"
                        v-model="addOneMaxPoint"
                        @update:model-value="updateClanARoster()"
                    />
                </label>
            </div>
            <button
                type="button"
                class="btn btn-primary"
                :disabled="!clanASelectionValid || !clanBSelectionValid"
                @click.prevent="simulateBattles"
            >
                Calculate Battles
            </button>
            <div v-if="simulationComplete" class="mt-5 text-right">
                As the attacker, {{ clanANameFixed }} wins
                <span
                    class="text-xl"
                    :class="{
                        'text-error':
                            clanASimulationWinPercentage <
                            clanBSimulationWinPercentage,
                        'text-green-400':
                            clanASimulationWinPercentage >
                            clanBSimulationWinPercentage,
                    }"
                    >{{ clanASimulationWinPercentage }}</span
                >% of the time
                <br />
                As the defender, {{ clanBNameFixed }} wins
                <span
                    class="text-xl"
                    :class="{
                        'text-error':
                            clanASimulationWinPercentage >
                            clanBSimulationWinPercentage,
                        'text-green-400':
                            clanASimulationWinPercentage <
                            clanBSimulationWinPercentage,
                    }"
                    >{{ clanBSimulationWinPercentage }}</span
                >% of the time
            </div>
        </div>
    </div>

    <div class="flex max-xl:flex-col flex-row justify-evenly xl:gap-10">
        <div
            class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 grow"
        >
            <div class="card-body">
                <div class="flex justify-between">
                    <button
                        type="button"
                        @click.prevent="switchClanAWithB"
                        class="btn btn-primary btn-sm"
                        :disabled="loadingA || loadingB"
                    >
                        Switch Attackers to Defenders
                    </button>
                    <ClanSearch
                        class="w-full"
                        @update:model-value="onUpdateClanA"
                        v-model="clanAName"
                    />
                </div>
                <div class="w-full">
                    <div class="flex justify-end items-center">
                        <div class="me-2">Select Roster</div>
                        <select
                            class="select select-bordered select-sm"
                            v-model="clanARosterSelect"
                        >
                            <option value="Territory">Territory</option>
                            <option value="Vault">Vault</option>
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="table md:table-md table-xs">
                        <caption
                            v-if="!loadingA && clanANameFixed"
                            class="caption-top mb-5 text-lg"
                            :class="{ 'text-error': !clanASelectionValid }"
                        >
                            {{
                                clanANameFixed
                            }}
                            - Attackers ({{
                                clanARanked.filter((x) => x.selected).length
                            }}
                            / 20)
                        </caption>
                        <thead>
                            <tr>
                                <th class="w-[80px]"></th>
                                <th class="w-[80px] text-center"></th>
                                <th>Name</th>
                                <th class="text-right">Combined Level</th>
                                <th class="text-right">Max Points</th>
                            </tr>
                        </thead>
                        <tbody
                            v-if="loadingA"
                            class="mx-auto my-[100px] w-full text-center"
                        >
                            <tr>
                                <td colspan="5">
                                    <span
                                        class="loading loading-spinner text-primary loading-md mx-auto"
                                    ></span>
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr
                                v-for="(p, i) in clanARanked"
                                :key="p.id"
                                @click.stop="p.selected = !p.selected"
                                class="cursor-pointer hover:bg-base-100-50"
                                :class="{ 'text-gray-400': i >= 40 }"
                            >
                                <td class="text-center">
                                    <input
                                        type="checkbox"
                                        class="checkbox checkbox-primary card"
                                        v-model="p.selected"
                                    />
                                </td>
                                <td class="avatar">
                                    <div
                                        class="mask mask-square rounded-lg w-12 h-12"
                                    >
                                        <img
                                            :src="`https://media.estfor.com/characters/${p.avatarId}.jpg`"
                                        />
                                    </div>
                                </td>
                                <td>{{ p.name }}</td>
                                <td class="text-right">{{ p.totalLevel }}</td>
                                <td class="text-right">{{ p.diceRolls }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div
            class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 grow"
        >
            <div class="card-body">
                <ClanSearch
                    class="w-full"
                    @update:model-value="onUpdateClanB"
                    v-model="clanBName"
                />
                <div class="w-full">
                    <div class="flex justify-end items-center">
                        <div class="me-2">Select Roster</div>
                        <select
                            class="select select-bordered select-sm"
                            v-model="clanBRosterSelect"
                        >
                            <option value="Territory">Territory</option>
                            <option value="Vault">Vault</option>
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="table md:table-md table-xs">
                        <caption
                            v-if="!loadingB && clanBNameFixed"
                            class="caption-top mb-5 text-lg"
                            :class="{ 'text-error': !clanBSelectionValid }"
                        >
                            {{
                                clanBNameFixed
                            }}
                            - Defenders ({{
                                clanBRanked.filter((x) => x.selected).length
                            }}
                            / 20)
                        </caption>
                        <thead>
                            <tr>
                                <th class="w-[80px]"></th>
                                <th class="w-[80px] text-center"></th>
                                <th>Name</th>
                                <th class="text-right">Combined Level</th>
                                <th class="text-right">Max Points</th>
                            </tr>
                        </thead>
                        <tbody
                            v-if="loadingB"
                            class="mx-auto my-[100px] w-full text-center"
                        >
                            <tr>
                                <td colspan="5">
                                    <span
                                        class="loading loading-spinner text-primary loading-md mx-auto"
                                    ></span>
                                </td>
                            </tr>
                        </tbody>
                        <tbody v-else>
                            <tr
                                v-for="(p, i) in clanBRanked"
                                :key="p.id"
                                @click.stop="p.selected = !p.selected"
                                class="cursor-pointer hover:bg-base-100-50"
                                :class="{ 'text-gray-400': i >= 40 }"
                            >
                                <td class="text-center">
                                    <input
                                        type="checkbox"
                                        class="checkbox checkbox-primary card"
                                        v-model="p.selected"
                                    />
                                </td>
                                <td class="avatar">
                                    <div
                                        class="mask mask-square rounded-lg w-12 h-12"
                                    >
                                        <img
                                            :src="`https://media.estfor.com/characters/${p.avatarId}.jpg`"
                                        />
                                    </div>
                                </td>
                                <td>{{ p.name }}</td>
                                <td class="text-right">{{ p.totalLevel }}</td>
                                <td class="text-right">{{ p.diceRolls }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useCoreStore } from "../store/core"
import {
    calculateBattleChances,
    getDiceRolls,
    useClanStore,
} from "../store/clan"
import { getClanMembers } from "../utils/api"
import { Clan, Player } from "@paintswap/estfor-definitions/types"
import ClanSearch from "./inputs/ClanSearch.vue"

const coreStore = useCoreStore()
const clanStore = useClanStore()

const loadingA = ref(false)
const loadingB = ref(false)

const simulationCount = ref(10000)
const addOneMaxPoint = ref(false)

const clanA = ref<Player[]>([])
const clanAName = ref("")
const clanANameFixed = ref("")
const clanAClan = ref<Clan>()

const clanB = ref<Player[]>([])
const clanBName = ref("")
const clanBNameFixed = ref("")
const clanBClan = ref<Clan>()

const simulationComplete = ref(false)
const clanASimulationWinPercentage = ref("0")
const clanBSimulationWinPercentage = ref("0")

const clanARanked = ref<any[]>([])
const clanBRanked = ref<any[]>([])
const clanARosterSelect = ref("Territory")
const clanBRosterSelect = ref("Territory")
const battleArena = ref("Territory")

const clanASelectionValid = computed(
    () =>
        clanARanked.value.filter((x) => x.selected).length <= 20 &&
        clanARanked.value.filter((x) => x.selected).length > 0
)
const clanBSelectionValid = computed(
    () =>
        clanBRanked.value.filter((x) => x.selected).length <= 20 &&
        clanBRanked.value.filter((x) => x.selected).length > 0
)

const updateClanARoster = () => {
    const currentRoster =
        (clanARosterSelect.value === "Territory"
            ? clanAClan.value?.territoryCombatants?.map((x) => x.id)
            : clanAClan.value?.lockedVaultCombatants?.map((x) => x.id)) || []
    clanARanked.value = clanA.value
        .map((x) => {
            return {
                ...x,
                diceRolls: getDiceRolls(x, addOneMaxPoint.value),
            }
        })
        .sort((a, b) =>
            b.diceRolls > a.diceRolls ? 1 : b.diceRolls < a.diceRolls ? -1 : 0
        )
        .map((x, i) => {
            return {
                ...x,
                selected:
                    currentRoster.length > 0
                        ? currentRoster.includes(x.id)
                        : i < 20,
            }
        })
}

const updateClanBRoster = () => {
    const currentRoster =
        (clanBRosterSelect.value === "Territory"
            ? clanBClan.value?.territoryCombatants?.map((x) => x.id)
            : clanBClan.value?.lockedVaultCombatants?.map((x) => x.id)) || []
    clanBRanked.value = clanB.value
        .map((x) => {
            return {
                ...x,
                diceRolls: getDiceRolls(x),
            }
        })
        .sort((a, b) =>
            b.diceRolls > a.diceRolls ? 1 : b.diceRolls < a.diceRolls ? -1 : 0
        )
        .map((x, i) => {
            return {
                ...x,
                selected:
                    currentRoster.length > 0
                        ? currentRoster.includes(x.id)
                        : i < 20,
            }
        })
}

const loadClanA = async (clan: Clan) => {
    const clanMembersResult = await getClanMembers(clan.id)
    clanAClan.value = clan
    clanA.value = clanMembersResult.clanMembers.map((x) => x.player)
    clanANameFixed.value = clanMembersResult.clanMembers[0]?.clan?.name || ""
    updateClanARoster()
}

const loadClanB = async (clan: Clan) => {
    const clanMembersResult = await getClanMembers(clan.id)
    clanBClan.value = clan
    clanB.value = clanMembersResult.clanMembers.map((x) => x.player)
    clanBNameFixed.value = clanMembersResult.clanMembers[0]?.clan?.name || ""
    updateClanBRoster()
}

const onUpdateClanA = async (name: string) => {
    const clan = clanStore.clans.find(
        (x) => x.name.toLowerCase() === name.toLowerCase()
    )
    if (clan?.id) {
        simulationComplete.value = false
        loadingA.value = true
        await loadClanA(clan)
        loadingA.value = false
    }
}

const onUpdateClanB = async (name: string) => {
    const clan = clanStore.clans.find(
        (x) => x.name.toLowerCase() === name.toLowerCase()
    )
    if (clan?.id) {
        simulationComplete.value = false
        loadingB.value = true
        await loadClanB(clan)
        loadingB.value = false
    }
}

const simulateBattles = async () => {
    if (simulationCount.value > 100000) {
        simulationCount.value = 100000
    }

    const results = calculateBattleChances(
        simulationCount.value,
        clanARanked.value.filter((x) => x.selected),
        clanBRanked.value.filter((x) => x.selected),
        addOneMaxPoint.value,
        battleArena.value
    )

    clanASimulationWinPercentage.value = results.clanA
    clanBSimulationWinPercentage.value = results.clanB
    simulationComplete.value = true
}

const switchClanAWithB = () => {
    let tempClan
    let tempClanNameFixed = ""
    let tempClanMembers
    if (clanAClan.value) {
        tempClan = JSON.parse(JSON.stringify(clanAClan.value))
        tempClanNameFixed = clanANameFixed.value
        tempClanMembers = JSON.parse(JSON.stringify(clanA.value))
    } else {
        tempClan = {} as Clan
        tempClanMembers = []
    }

    if (clanBClan.value) {
        clanAClan.value = JSON.parse(JSON.stringify(clanBClan.value))
        clanA.value = JSON.parse(JSON.stringify(clanB.value))
        clanANameFixed.value = clanBNameFixed.value
    } else {
        clanAClan.value = {} as Clan
        clanA.value = []
        clanANameFixed.value = ""
    }

    if (clanAClan.value) {
        clanBClan.value = tempClan
        clanB.value = tempClanMembers
        clanBNameFixed.value = tempClanNameFixed
    }
    updateClanARoster()
    updateClanBRoster()
    simulateBattles()
}

const init = async () => {
    loadingA.value = true

    await clanStore.getAllClanInfo()
    if (coreStore.clanState) {
        await loadClanA(coreStore.clanState)
    }

    loadingA.value = false
}

onMounted(init)
watch(() => clanARosterSelect.value, updateClanARoster)
watch(() => clanBRosterSelect.value, updateClanBRoster)
</script>
