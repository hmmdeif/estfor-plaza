<template>
    <dialog id="action_modal" class="modal">
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
                            <th class="text-left">Action</th>
                            <th class="text-right">Level</th>
                            <th class="text-right">XP (per hour)</th>
                            <th class="text-left">Item required</th>
                            <th class="text-right">Guaranteed Loot (per hour)</th>
                            <th class="text-right">Random Loot (per hour)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="a in actions"
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
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { actionNames, skillNames } from "../../store/skills"
import { getLevel, useCoreStore, skillToXPMap } from "../../store/core"
import { getItemName } from "../../store/items"
import { useSearchStore } from "../../store/search"
import { allActions } from "../../data/actions"
import { Skill } from "@paintswap/estfor-definitions/types"
import { landscapeImage } from "../../utils/media"
import { calculateChance } from "../../utils/player"

const coreStore = useCoreStore()
const skillId = ref(0)
const searchStore = useSearchStore()

const playerXp = computed(() => {
    // @ts-ignore
    return coreStore.playerState[skillToXPMap[skillId.value]]
})

const actions = computed(() => {
    const a = [...allActions.filter((x) => x.info.skill === skillId.value)]
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
    const dialog = document.getElementById("action_modal") as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog,
})
</script>
