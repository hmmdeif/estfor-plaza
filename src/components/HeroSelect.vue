<template>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10">
        <div class="card-body flex flex-row max-md:flex-col gap-5 items-center">
            <div class="flex-initial w-1/3 min-w-[200px]">
                <Avatar
                    :id="coreStore.playerState.avatarId"
                    :name="coreStore.playerState.name"
                />
            </div>
            <div class="grow overflow-x-auto">
                <table class="table md:table-md table-xs text-lg">
                    <caption class="caption-top">
                        Hero Roster
                    </caption>
                    <thead>
                        <tr>
                            <th class="w-[100px] text-center">Avatar</th>
                            <th>Name</th>
                            <th class="w-[100px] text-right">Battle Points</th>
                            <th class="w-[210px] text-right">
                                <div class="items-center flex justify-end">
                                    <button
                                        type="button"
                                        class="btn btn-primary btn-outline btn-sm mr-2"
                                        @click.prevent="exportHeroes"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="1.5"
                                            stroke="#fff"
                                            class="w-6 h-6"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        class="btn btn-error btn-outline btn-sm mr-2"
                                        @click.prevent="clearRoster"
                                    >
                                        Clear Roster
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="h in coreStore.heroRoster" :key="h.id">
                            <td>
                                <img
                                    :src="`https://media.estfor.com/characters/${h.avatarId}.jpg`"
                                    class="rounded-lg"
                                />
                            </td>
                            <td>{{ h.name }}</td>
                            <td class="w-[100px] text-right">
                                {{ getDiceRolls(h) }}
                            </td>
                            <td>
                                <button
                                    type="button"
                                    class="btn btn-primary mr-2 btn-xs md:btn-md"
                                    :disabled="coreStore.playerId == h.id"
                                    @click.prevent="selectHero(h)"
                                >
                                    Select
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-error btn-outline btn-xs md:btn-md"
                                    :disabled="coreStore.playerId == h.id"
                                    @click.prevent="
                                        coreStore.removeHeroFromRoster(h)
                                    "
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                        <tr v-if="coreStore.heroRoster.length === 0">
                            <td colspan="3" class="text-center">
                                No heroes in roster
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="card bg-base-100-50 shadow-xl rounded-lg mt-10">
        <div class="card-body">
            <div class="flex flex-col md:flex-row justify-evenly items-center">
                <div class="join items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 mr-2 text-primary"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Hero Search"
                        class="input input-bordered bg-base-100-50"
                        v-model="heroSearch"
                    />
                </div>

                <div class="items-center flex flex-col md:flex-row gap-2">
                    <ClanSearch
                        container-class="justify-center"
                        input-class="input-md"
                        @update:model-value="onUpdateClanName"
                        v-model="clanName"
                    />
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click.prevent="addClanToRoster"
                        :disabled="!selectedClan || loading"
                    >
                        Add Clan to Roster
                    </button>
                </div>
            </div>

            <div class="text-center mt-5">
                <div>
                    Here you can select any hero and load their skills into the
                    Plaza to calculate their combat stats and skill training
                    times.
                    <img
                        src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                        class="rounded-lg w-[20px] inline cursor-pointer"
                        alt="Emerald Brooch"
                        width="77"
                        height="80"
                        decoding="async"
                        @click.prevent="emeraldBroochPaywallRef?.openDialog()"
                    />
                </div>
                <ol class="list-decimal list-inside mt-5">
                    <li>Search for the hero name</li>
                    <li>Click on the hero portrait you wish to load</li>
                </ol>
                <div class="mt-5">Or</div>
                <ol class="list-decimal list-inside mt-5">
                    <li>Search for a clan name</li>
                    <li>
                        Click on Add Clan to Roster button to add all the
                        members to your roster
                    </li>
                </ol>
            </div>

            <div v-if="loading" class="mx-auto my-[100px] w-full text-center">
                <span
                    class="loading loading-spinner text-primary loading-md mx-auto"
                ></span>
            </div>

            <div v-if="!loading" class="flex flex-wrap justify-evenly">
                <div
                    v-for="p in heroSearchResults"
                    :key="p.id"
                    class="lg:w-1/5 md:w-1/4 sm:w-1/3 w-1/2 cursor-pointer hover:bg-base-100-50 rounded-lg px-5 pb-5"
                    @click.prevent="selectHero(p)"
                >
                    <Avatar :id="p.avatarId" :name="p.name" />
                </div>
            </div>
        </div>
    </div>
    <EmeraldBroochPaywall
        ref="emeraldBroochPaywallRef"
        id="hero_select_emerald_brooch_modal"
    />
</template>

<script setup lang="ts">
import Avatar from "./Avatar.vue"
import { ref, onMounted, watch } from "vue"
import { getClanMembers, getPlayers } from "../utils/api"
import { useAppStore } from "../store/app"
import { getLevel, useCoreStore } from "../store/core"
import EmeraldBroochPaywall from "./dialogs/EmeraldBroochPaywall.vue"
import { Clan, Player } from "@paintswap/estfor-definitions/types"
import { getDiceRolls, useClanStore } from "../store/clan"
import ClanSearch from "./inputs/ClanSearch.vue"

const app = useAppStore()
const coreStore = useCoreStore()
const clanStore = useClanStore()

const heroSearch = ref("")
const heroSearchResults = ref<Player[]>([])
const loading = ref(false)
const clanName = ref("")
const selectedClan = ref<Clan | null>(null)

const emeraldBroochPaywallRef = ref<typeof EmeraldBroochPaywall>()

watch(heroSearch, (search, _previousSearch, onCleanup) => {
    const timeout = window.setTimeout(async () => {
        if (search === "") {
            heroSearchResults.value = []
            return
        }
        loading.value = true
        try {
            const players = await getPlayers(search)
            heroSearchResults.value = players.players
        } catch (e) {
            console.error(`Failed to search ${search}`, e)
        } finally {
            loading.value = false
        }
    }, 500)

    onCleanup(() => window.clearTimeout(timeout))
})

const selectHero = async (player: Player) => {
    loading.value = true
    const previousHeroSearchValue = heroSearch.value
    try {
        await coreStore.loadPlayer(player.id)
        heroSearch.value = player.name
        app.addToast(`${player.name} loaded`, "alert-success", 5000)
    } catch (e: any) {
        if (e.message === "NO_BROOCH") {
            emeraldBroochPaywallRef.value?.openDialog()
        } else {
            console.error(`Failed to load ${player.name}`, e)
            app.addToast(`Failed to load ${player.name}`, "alert-error", 5000)
        }
        loading.value = false
    } finally {
        // case when selecting the hero with the same name as the search term
        if (previousHeroSearchValue === heroSearch.value) {
            loading.value = false
        }
    }
}

const onUpdateClanName = async (name: string) => {
    selectedClan.value = null
    const clan = clanStore.clans.find(
        (x) => x.name.toLowerCase() === name.toLowerCase()
    )
    if (clan?.id) {
        selectedClan.value = clan
    }
}

const addClanToRoster = async () => {
    if (selectedClan.value) {
        loading.value = true
        try {
            const clanMembersResult = await getClanMembers(
                selectedClan.value.id,
            )
            heroSearchResults.value = clanMembersResult.clanMembers.map(
                (x) => x.player
            )
            for (const p of clanMembersResult.clanMembers) {
                await coreStore.addHeroToRoster(p.player)
            }
        } finally {
            loading.value = false
        }
    }
}

const exportHeroes = async () => {
    const heroes = coreStore.heroRoster.map((h) => {
        return {
            id: h.id,
            name: h.name,
            avatarId: h.avatarId,
            isActive: h.isActive,
            battlePoints: getDiceRolls(h),
            woodcutting: getLevel(h.woodcuttingXP),
            mining: getLevel(h.miningXP),
            fishing: getLevel(h.fishingXP),
            cooking: getLevel(h.cookingXP),
            smithing: getLevel(h.smithingXP),
            crafting: getLevel(h.craftingXP),
            firemaking: getLevel(h.firemakingXP),
            thieving: getLevel(h.thievingXP),
            forging: getLevel(h.forgingXP),
            fletching: getLevel(h.fletchingXP),
            alchemy: getLevel(h.alchemyXP),
            health: getLevel(h.healthXP),
            melee: getLevel(h.meleeXP),
            ranged: getLevel(h.rangedXP),
            magic: getLevel(h.magicXP),
            defence: getLevel(h.defenceXP),
            farming: getLevel(h.farmingXP),
            isEvolved: h.isFullMode,
            questsCompleted: h.numFixedQuestsCompleted,
        }
    })

    // convert heroes to text/csv
    const heroesCSVHeader = Object.keys(heroes[0]).join(",")
    let heroesCSV = heroes
        .map((h) => {
            return Object.values(h).join(",")
        })
        .join("\n")
    heroesCSV = `${heroesCSVHeader}\n${heroesCSV}`

    const data = new Blob([heroesCSV], { type: "text/csv" })
    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = "heroes.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
}

const clearRoster = async () => {
    loading.value = true
    try {
        await coreStore.getActivePlayer()
        for (const h of coreStore.heroRoster.filter(
            (x) => x.id !== coreStore.playerId.toString()
        )) {
            coreStore.removeHeroFromRoster(h)
        }
    } finally {
        loading.value = false
    }
}

const init = async () => {
    loading.value = true
    try {
        await clanStore.getAllClanInfo()
        await coreStore.refreshHeroRoster()
    } finally {
        loading.value = false
    }
}

onMounted(init)
</script>
