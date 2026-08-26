<template>
    <div
        class="card bg-base-100-50 shadow-xl rounded-lg mt-10 w-full md:basis-3/4 xl:basis-1/2"
    >
        <div class="card-body">
            <h2 class="text-2xl font-bold text-center">Assigned Heroes</h2>
            <div class="flex items-center justify-between">
                <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    @click="selectAllReady"
                >
                    Select Only Ready
                </button>

                <div class="flex items-center justify-end">
                    <div class="join items-center justify-end">
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
                            placeholder="Search"
                            class="input input-bordered bg-base-100-50 input-sm"
                            v-model="searchValue"
                        />
                    </div>
                    <AssignedHeroGroupSelect
                        class="ms-2"
                        v-model="selectedHeroGroup"
                        :heroes="factoryStore.assignedProxys"
                        @update:modelValue="pageNumber = 0"
                    />
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input
                        id="hideHeroNames"
                        type="checkbox"
                        class="checkbox checkbox-primary"
                        v-model="hideHeroNames"
                    />
                    <label for="hideHeroNames" class="ml-2 text-xs">Hide Hero Names</label>
                </div>
            
                <div class="flex items-center justify-end">
                    <label for="matchAction" class="mr-2 text-xs">Match Running Action</label>
                    <input
                        id="matchAction"
                        type="checkbox"
                        class="checkbox checkbox-primary"
                        v-model="matchAction"
                    />
                    <AssignedHeroSkillSelect
                        class="ms-2"
                        v-model="selectedSkillGroup"
                        :heroes="factoryStore.assignedProxys"
                        @update:modelValue="pageNumber = 0"
                        :show-all="!matchAction"
                    />
                </div>
            </div>

            <hr class="my-2 border-primary" />

            <div class="overflow-x-auto">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="w-[80px]">
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-primary"
                                    v-model="selectAll"
                                    @change="selectAllSilos"
                                />
                            </th>
                            <th>Name</th>
                            <th>Queued Action</th>
                            <th>Running Action</th>
                            <th class="w-[80px] text-center">Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="silo in pagedAssignedSilos"
                            :key="silo.address"
                        >
                            <td>
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-primary"
                                    v-model="silo.selected"
                                />
                            </td>
                            <td>
                                {{ hideHeroNames ? silo.class : silo.playerState.name + ' / ' + silo.class }}
                            </td>
                            <td>
                                {{ decodeTransaction(silo.savedTransactions) }}
                            </td>
                            <td>
                                <div
                                    v-for="(action, i) in silo.queuedActions"
                                    :key="i"
                                    class="flex items-center justify-between"
                                >
                                    <div>
                                        {{
                                            actionNames[
                                                Number(action.actionId)
                                            ] ||
                                            actionChoiceNames[
                                                Number(action.choice.id)
                                            ] ||
                                            ""
                                        }}
                                    </div>
                                    <div>{{ calculateTimeLeft(action) }}</div>
                                </div>
                            </td>
                            <td>
                                <div
                                    v-if="silo.isPaused"
                                    class="badge badge-warning p-3"
                                >
                                    Paused
                                </div>
                                <div
                                    v-else
                                    class="badge badge-primary text-white border-primary"
                                >
                                    Active
                                </div>
                            </td>
                            <td>
                                <a
                                    :href="`https://estfor.com/journal/${silo.playerId}`"
                                    target="_blank"
                                    class="max-sm:hidden"
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
                                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                        />
                                    </svg>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="assignedSilosRef.length > pageSize" class="join mx-auto">
                <button
                    :disabled="pageNumber === 0"
                    class="join-item btn btn-primary"
                    @click="pageNumber = pageNumber - 1"
                >
                    «
                </button>
                <button
                    v-for="p in pagesToSelect"
                    :key="p"
                    :disabled="p === pageNumber + 1"
                    class="join-item btn btn-primary"
                    @click="pageNumber = p - 1"
                >
                    {{ p }}
                </button>
                <button
                    :disabled="pageNumber + 1 === totalPages"
                    class="join-item btn btn-primary"
                    @click="pageNumber = pageNumber + 1"
                >
                    »
                </button>
            </div>
            <div class="flex items-center">
                <div class="dropdown dropdown-top">
                    <div
                        tabindex="0"
                        role="button"
                        class="btn btn-primary mt-5 me-2"
                    >
                        Additional Actions
                    </div>
                    <ul
                        tabindex="0"
                        class="dropdown-content z-[1] menu p-2 w-52 rounded-box shadow-sm bg-base-100-50"
                    >
                        <li>
                            <button
                                type="button"
                                class="btn btn-primary btn-sm mb-2"
                                @click="assignHeroes"
                                :disabled="executing || !selectedSilos.length"
                            >
                                Reassign {{ selectedSilos.length }} Hero{{
                                    selectedSilos.length !== 1 ? "es" : ""
                                }}
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                class="btn btn-primary btn-sm"
                                @click="evolveHeroes"
                                :disabled="executing || !selectedSilos.length"
                            >
                                Evolve {{ selectedSilos.length }} Hero{{
                                    selectedSilos.length !== 1 ? "es" : ""
                                }}
                            </button>
                        </li>
                    </ul>
                </div>

                <button
                    type="button"
                    class="btn btn-primary mt-5 grow"
                    @click="openExecuteTransactions"
                    :disabled="!selectedSilos.length"
                >
                    Execute Actions for {{ selectedSilos.length }} Hero{{
                        selectedSilos.length !== 1 ? "es" : ""
                    }}
                </button>
            </div>
        </div>
    </div>
    <AssignHero
        ref="assignHeroRef"
        id="reassign_hero_modal"
        :chainId="props.chainId"
    />
    <EvolveHero
        ref="evolveHeroRef"
        id="evolve_hero_modal"
        :chainId="props.chainId"
    />
    <ExecuteSiloActions
        ref="executeActionsRef"
        id="execute_actions_modal"
        :chainId="props.chainId"
    />
</template>

<script setup lang="ts">
import {
    decodeSkillFromTransaction,
    decodeTransaction,
    useFactoryStore,
} from "../../store/factory"
import { computed, ref, watch } from "vue"
import AssignHero from "../dialogs/AssignHero.vue"
import { QueuedAction, Skill } from "@paintswap/estfor-definitions/types"
import { actionChoiceNames, actionNames } from "../../store/skills"
import ExecuteSiloActions from "../dialogs/ExecuteSiloActions.vue"
import AssignedHeroGroupSelect from "../inputs/AssignedHeroGroupSelect.vue"
import AssignedHeroSkillSelect from "../inputs/AssignedHeroSkillSelect.vue"
import EvolveHero from "../dialogs/EvolveHero.vue"
import { getHeroClass } from "../../utils/player"
import type { SonicChainId } from "../../config"

const props = defineProps<{
    chainId: SonicChainId
}>()

const factoryStore = useFactoryStore()
const executing = ref(false)
const pageSize = ref(20)
const pageNumber = ref(0)
const selectAll = ref(false)
const searchValue = ref("")
const selectedHeroGroup = ref("")
const selectedSkillGroup = ref(Skill.NONE)
const matchAction = ref(true)
const hideHeroNames = ref(true)
const assignHeroRef = ref<typeof AssignHero>()
const executeActionsRef = ref<typeof ExecuteSiloActions>()
const evolveHeroRef = ref<typeof EvolveHero>()

const assignedSilos = computed(() => {
    const assignedProxys = factoryStore.assignedProxys
        .filter(
            (s) =>
                s.playerState.name
                    ?.toLowerCase()
                    ?.indexOf(searchValue.value?.toLowerCase()) > -1 ||
                decodeTransaction(s.savedTransactions)
                    ?.toLowerCase()
                    ?.indexOf(searchValue.value?.toLowerCase()) > -1 ||
                s.queuedActions
                    ?.map(
                        (a) =>
                            actionNames[Number(a.actionId)] ||
                            actionChoiceNames[Number(a.choice?.id)] ||
                            ""
                    )
                    ?.join(" ")
                    ?.toLowerCase()
                    ?.indexOf(searchValue.value?.toLowerCase()) > -1
        )
        .filter(
            (s) =>
                selectedHeroGroup.value === "" ||
                decodeTransaction(s.savedTransactions) ===
                    selectedHeroGroup.value ||
                s.queuedActions
                    .map(
                        (a) =>
                            actionNames[Number(a.actionId)] ||
                            actionChoiceNames[Number(a.choice?.id)] ||
                            ""
                    )
                    .includes(selectedHeroGroup.value)
        )
        .filter(
            (s) => {
                if (matchAction.value) {
                    return selectedSkillGroup.value === Skill.NONE ||
                    decodeSkillFromTransaction(s.savedTransactions) ===
                        selectedSkillGroup.value ||
                    s.queuedActions
                            .map((a) => a.skill)
                            .includes(selectedSkillGroup.value)
                } else {
                    return true
                }
            }
        )
    assignedProxys.sort((a, b) => {
        const aDecoded = decodeTransaction(a.savedTransactions)
        const bDecoded = decodeTransaction(b.savedTransactions)
        if (aDecoded < bDecoded) {
            return -1
        }
        if (aDecoded > bDecoded) {
            return 1
        }
        return 0
    })
    return assignedProxys
})
const assignedSilosRef = ref(
    assignedSilos.value.map((s) => ({ ...s, selected: false, class: getHeroClass(s.playerState, selectedSkillGroup.value) }))
)

const pagedAssignedSilos = computed(() => {
    const start = pageNumber.value * pageSize.value
    return assignedSilosRef.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => {
    return Math.ceil(assignedSilosRef.value.length / pageSize.value)
})

const pagesToSelect = computed(() => {
    const pages = []
    if (totalPages.value > 5) {
        if (pageNumber.value + 1 < 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
        } else if (pageNumber.value + 1 > totalPages.value - 3) {
            for (let i = totalPages.value - 4; i < totalPages.value + 1; i++) {
                pages.push(i)
            }
        } else {
            for (let i = pageNumber.value - 1; i < pageNumber.value + 4; i++) {
                pages.push(i)
            }
        }
    } else {
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i)
        }
    }
    return pages
})

const selectAllSilos = () => {
    for (const silo of assignedSilosRef.value) {
        silo.selected = selectAll.value
    }
}

const selectAllReady = () => {
    for (const silo of assignedSilosRef.value) {
        let ready = true
        if (silo.queuedActions) {
            for (const a of silo.queuedActions) {
                const s = calculateTimeLeft(a)
                if (s !== "Ready") {
                    ready = false
                    break
                }
            }
        }
        silo.selected = ready
    }
}

const selectedSilos = computed(() =>
    assignedSilosRef.value.filter((s) => s.selected)
)

const openExecuteTransactions = () => {
    executeActionsRef.value?.openDialog(selectedSilos.value)
}

const assignHeroes = () => {
    assignHeroRef.value?.openDialog(
        assignedSilosRef.value.filter((x) => x.selected)
    )
}

const evolveHeroes = () => {
    evolveHeroRef.value?.openDialog(
        assignedSilosRef.value.filter(
            (x) => x.selected && !x.playerState.isFullMode
        )
    )
}

const calculateTimeLeft = (queuedAction: QueuedAction) => {
    const startTime = parseInt(queuedAction.startTime)
    const endTime = startTime + queuedAction.timespan
    const timeLeft = endTime * 1000 - Date.now()
    // return time left in hours only
    return timeLeft > 0 ? `${Math.round(timeLeft / 1000 / 60 / 60)}h` : "Ready"
}

const resortSilos = () => {
    const newSilos = assignedSilos.value.map((s) => ({
            ...s,
            selected: false,
            class: getHeroClass(s.playerState, selectedSkillGroup.value)
        }))
        newSilos.sort((a, b) => {
            if (a.class > b.class) {
                return -1
            } else if (a.class < b.class) {
                return 1
            }
            return 0
        })
        assignedSilosRef.value = newSilos
}

watch (
    () => selectedSkillGroup.value,
    () => {
        resortSilos()
    }
)

watch(
    () => assignedSilos.value,
    () => {
        resortSilos()
    },
    { deep: true }
)
</script>
