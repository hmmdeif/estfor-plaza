<template>
    <dialog id="action_and_choice_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary md:w-4/5 max-w-full">
            <h3 class="font-bold text-lg text-center">{{ skillName }}</h3>
            <picture>
                <source v-if="imgSource?.avif" type="image/avif" :srcset="imgSource.avif" />
                <img
                    v-if="imgSource?.webp"
                    :src="imgSource.webp"
                    :alt="skillName"
                    class="w-full mx-auto mt-5 max-w-[800px] rounded-lg"
                />
            </picture>

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="text-left w-52">Action</th>
                            <th class="text-right w-40">Level</th>
                            <th class="text-right w-40">XP (per hour)</th>
                            <th class="text-left">Item required</th>
                            <th class="text-right">Guaranteed Loot (per hour)</th>
                            <th class="text-right">Random Loot (per hour)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="a in actionInputs"
                            :key="a.actionId"
                            :class="{
                                'text-gray-400': a.info.minXP > playerXp,
                            }"
                        >
                            <td class="text-left">
                                {{ actionNames[a.actionId] }}
                            </td>
                            <td class="text-right">
                                {{ getLevel(a.info.minXP) }}
                            </td>
                            <td class="text-right">{{ a.info.xpPerHour }}</td>
                            <td class="text-left">
                                {{ getItemName(a.info.handItemTokenIdRangeMin) || "None" }}
                            </td>
                            <td class="text-right cursor-pointer">
                                <span
                                    v-for="r in a.guaranteedRewards"
                                    :key="r.itemTokenId"
                                    class="text-xs flex justify-between"
                                    @click.prevent="
                                        searchStore.itemSearch = getItemName(r.itemTokenId)
                                    "
                                    ><span>{{ getItemName(r.itemTokenId) }}</span
                                    >{{ r.rate / 10 }}</span
                                >
                            </td>
                            <td class="text-right cursor-pointer">
                                <div
                                    v-for="r in a.randomRewards"
                                    :key="r.itemTokenId"
                                    class="text-xs flex justify-between"
                                    @click.prevent="
                                        searchStore.itemSearch = getItemName(r.itemTokenId)
                                    "
                                >
                                    <span>{{ getItemName(r.itemTokenId) }}</span
                                    ><span
                                        >{{ r.amount }} ({{
                                            calculateChance(r, a, playerXp).toFixed(2)
                                        }}%)</span
                                    >
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="text-left w-52">Item</th>
                            <th class="text-right w-40">Level</th>
                            <th class="text-right w-40">XP (per hour)</th>
                            <th class="text-right">Inputs (per hour)</th>
                            <th class="text-right">Output (per hour)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(a, i) in actions"
                            :key="i"
                            :class="{
                                'text-gray-400':
                                    (a.skillMinXPs[a.skills.findIndex((s) => s === skillId)] || 0) >
                                    playerXp,
                            }"
                        >
                            <td
                                class="text-left cursor-pointer"
                                @click.prevent="
                                    searchStore.itemSearch = getItemName(a.outputTokenId)
                                "
                            >
                                {{ getItemName(a.outputTokenId) }}
                            </td>
                            <td class="text-right">
                                {{
                                    getLevel(
                                        a.skillMinXPs[a.skills.findIndex((s) => s === skillId)] || 0
                                    )
                                }}
                            </td>
                            <td class="text-right">{{ a.xpPerHour }}</td>
                            <td class="text-left">
                                <div
                                    v-for="(x, i) in a.inputTokenIds"
                                    :key="x"
                                    class="flex justify-between cursor-pointer"
                                    @click.prevent="searchStore.itemSearch = getItemName(x)"
                                >
                                    <div>{{ getItemName(x) }}</div>
                                    <div>
                                        {{ (a.inputAmounts[i] * a.rate) / 1000 }}
                                    </div>
                                </div>
                            </td>
                            <td class="text-right">
                                <span v-if="a.successPercent < 100">{{
                                    (
                                        ((a.outputAmount * a.rate) / 1000) *
                                        calculateActionChoiceSuccessPercent(a, playerXp, skillId)
                                    ).toFixed(1)
                                }}</span>
                                <span v-else>{{ (a.outputAmount * a.rate) / 1000 }}</span>
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
import { actionNames, skillNames, useSkillStore } from "../../store/skills"
import { getLevel, useCoreStore, skillToXPMap } from "../../store/core"
import { getItemName } from "../../store/items"
import { useSearchStore } from "../../store/search"
import { ActionChoiceInput, Skill } from "@paintswap/estfor-definitions/types"
import { landscapeImage } from "../../utils/media"
import { allActions } from "../../data/actions"
import { calculateActionChoiceSuccessPercent, calculateChance } from "../../utils/player"

const coreStore = useCoreStore()
const skillId = ref(0)
const skillStore = useSkillStore()
const searchStore = useSearchStore()

const playerXp = computed(() => {
    // @ts-ignore
    return coreStore.playerState[skillToXPMap[skillId.value]]
})

const actionInputs = computed(() => {
    const a = [
        ...allActions.filter(
            (x) => x.info.skill === skillId.value && x.info.actionChoiceRequired === false
        ),
    ]
    a.sort((a, b) => (a.info.minXP > b.info.minXP ? 1 : -1))
    return a.filter(
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
            ) ||
            getItemName(x.info.handItemTokenIdRangeMax)
                ?.toLowerCase()
                .includes(searchStore.itemSearch.toLowerCase()) ||
            getItemName(x.info.handItemTokenIdRangeMax)
                ?.toLowerCase()
                .includes(searchStore.itemSearch.toLowerCase())
    )
})

const actions = computed(() => {
    let a: ActionChoiceInput[] = []
    switch (skillId.value) {
        case Skill.COOKING:
            a = [...skillStore.cooking]
            break
        case Skill.CRAFTING:
            a = [...skillStore.crafting]
            break
        case Skill.SMITHING:
            a = [...skillStore.smithing]
            break
        case Skill.FIREMAKING:
            a = [...skillStore.firemaking]
            break
        case Skill.ALCHEMY:
            a = [...skillStore.alchemy]
            break
        case Skill.FORGING:
            a = [...skillStore.forging]
            break
        case Skill.FLETCHING:
            a = [...skillStore.fletching]
            break
        case Skill.FARMING:
            a = [...(skillStore.farming.filter((x) => !("info" in x)) as ActionChoiceInput[])]
            break
        default:
            return []
    }
    a.sort((a, b) => {
        if (
            (a.skillMinXPs[a.skills.findIndex((s) => s === skillId.value)] || 0) >
            (b.skillMinXPs[b.skills.findIndex((s) => s === skillId.value)] || 0)
        )
            return 1
        if (
            (a.skillMinXPs[a.skills.findIndex((s) => s === skillId.value)] || 0) <
            (b.skillMinXPs[b.skills.findIndex((s) => s === skillId.value)] || 0)
        )
            return -1
        return 0
    })
    return a.filter(
        (x) =>
            searchStore.itemSearch === "" ||
            x.inputTokenIds.some((y) =>
                getItemName(y)?.toLowerCase().includes(searchStore.itemSearch.toLowerCase())
            ) ||
            getItemName(x.outputTokenId)
                ?.toLowerCase()
                .includes(searchStore.itemSearch.toLowerCase()) ||
            getItemName(x.handItemTokenIdRangeMax)
                ?.toLowerCase()
                .includes(searchStore.itemSearch.toLowerCase()) ||
            getItemName(x.handItemTokenIdRangeMax)
                ?.toLowerCase()
                .includes(searchStore.itemSearch.toLowerCase())
    )
})

const skillName = computed(() => {
    // @ts-ignore
    return skillNames[skillId.value]
})

const imgSource = computed(() => {
    // @ts-ignore
    return landscapeImage(String(skillNames[skillId.value] ?? ""))
})

const openDialog = (_skillId: Skill) => {
    skillId.value = _skillId
    const dialog = document.getElementById("action_and_choice_modal") as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog,
})
</script>
