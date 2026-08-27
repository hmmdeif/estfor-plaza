<template>
    <BoostPanel :hide-combat="true" />
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
        <template v-for="action in actionsWithItemSearch" :key="action.skill">
            <div class="card bg-base-100-50 shadow-xl rounded-lg">
                <figure>
                    <picture>
                        <source
                            v-if="landscape(action.skill)?.avif"
                            type="image/avif"
                            :srcset="landscape(action.skill).avif"
                        />
                        <img
                            class="w-full cursor-pointer"
                            :src="landscape(action.skill)?.webp"
                            :alt="skillNames[action.skill]"
                            @click.prevent="
                                action.relevantAction.actionType === ActionType.actionAndChoice
                                    ? actionAndChoiceInfoRef?.openDialog(action.skill)
                                    : action.relevantAction.actionType === ActionType.action
                                      ? actionInfoRef?.openDialog(action.skill)
                                      : actionChoiceInfoRef?.openDialog(action.skill)
                            "
                        />
                    </picture>
                </figure>
                <div class="card-body">
                    <div class="grid grid-cols-2 gap-2">
                        <div class="flex-col flex justify-between">
                            <div class="flex flex-col">
                                <div class="text-2xl font-bold flex items-center gap-2">
                                    {{ skillNames[action.skill] || "Unknown" }}
                                    <div
                                        v-if="
                                            fullAttireMultiplier(coreStore.inventory, action.skill)
                                        "
                                        class="tooltip tooltip-primary tooltip-bottom"
                                        data-tip="Bonus XP from full attire outfit"
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
                                                d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
                                            />
                                        </svg>
                                    </div>
                                    <div
                                        v-if="
                                            heroAvatarMultiplier(
                                                coreStore.playerState,
                                                action.skill
                                            )
                                        "
                                        class="tooltip tooltip-primary tooltip-bottom"
                                        data-tip="Bonus XP from hero"
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
                                                d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div class="text-sm text-gray-400">
                                    {{ action.relevantAction.currentAction.name || "Unknown" }}
                                </div>
                            </div>
                            <div class="flex flex-col mt-5">
                                <div class="text-2xl font-bold">
                                    {{
                                        (
                                            action.relevantAction.currentAction.xpPerHour *
                                            coreStore.getXPBoostMultiplier(
                                                action.skill,
                                                BoostType.NON_COMBAT_XP
                                            )
                                        ).toFixed(0)
                                    }}
                                    XP/hour
                                </div>
                                <div class="text-sm text-gray-400">
                                    Level
                                    {{
                                        getLevel(action.relevantAction.currentXPForSkill.toString())
                                    }}
                                </div>
                            </div>
                        </div>
                        <div class="flex-col flex justify-between">
                            <div class="flex flex-col">
                                <div class="text-2xl font-bold">
                                    {{ hoursUntilNextAction(action.relevantAction) }}
                                    hour{{
                                        parseInt(hoursUntilNextAction(action.relevantAction)) > 1
                                            ? "s"
                                            : ""
                                    }}
                                    <div
                                        v-if="
                                            parseInt(hoursUntilNextLevel20(action.relevantAction)) >
                                            0
                                        "
                                        class="tooltip tooltip-primary tooltip-bottom"
                                        :data-tip="`${hoursUntilNextLevel20(
                                            action.relevantAction
                                        )} hour${
                                            parseInt(hoursUntilNextLevel20(action.relevantAction)) >
                                            1
                                                ? 's'
                                                : ''
                                        } until next level 20 boundary`"
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
                                </div>
                                <div class="text-sm text-gray-400">Until next action unlock</div>
                            </div>
                            <div v-if="action.relevantAction.nextAction" class="flex flex-col mt-5">
                                <div class="text-2xl font-bold">
                                    {{
                                        (
                                            action.relevantAction.nextAction?.xpPerHour *
                                            coreStore.getXPBoostMultiplier(
                                                action.skill,
                                                BoostType.NON_COMBAT_XP
                                            )
                                        ).toFixed(0)
                                    }}
                                    XP/hour
                                </div>
                                <div class="text-sm text-gray-400">
                                    Next action at level
                                    {{
                                        getLevel(action.relevantAction.nextAction.minXP.toString())
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
    <ActionInfo ref="actionInfoRef" />
    <ActionChoiceInfo ref="actionChoiceInfoRef" />
    <ActionAndChoiceInfo ref="actionAndChoiceInfoRef" />
</template>

<script setup lang="ts">
import { BoostType, Skill } from "@paintswap/estfor-definitions/types"
import { useSkillStore, RelevantAction, skillNames, ActionType } from "../store/skills"
import {
    useCoreStore,
    fullAttireMultiplier,
    heroAvatarMultiplier,
    xpBoundaries,
    getLevel,
} from "../store/core"
import { landscapeImage } from "../utils/media"
import { computed, ref } from "vue"
import BoostPanel from "./BoostPanel.vue"
import ItemSearch from "./ItemSearch.vue"
import ActionInfo from "./dialogs/ActionInfo.vue"
import ActionChoiceInfo from "./dialogs/ActionChoiceInfo.vue"
import ActionAndChoiceInfo from "./dialogs/ActionAndChoiceInfo.vue"
import { useSearchStore } from "../store/search"

const skillStore = useSkillStore()
const coreStore = useCoreStore()
const searchStore = useSearchStore()
const actionInfoRef = ref<typeof ActionInfo>()
const actionChoiceInfoRef = ref<typeof ActionChoiceInfo>()
const actionAndChoiceInfoRef = ref<typeof ActionAndChoiceInfo>()

const allActions = computed(() => {
    return [
        {
            skill: Skill.WOODCUTTING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.WOODCUTTING),
        },
        {
            skill: Skill.MINING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.MINING),
        },
        {
            skill: Skill.FISHING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FISHING),
        },
        {
            skill: Skill.COOKING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.COOKING),
        },
        {
            skill: Skill.SMITHING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.SMITHING),
        },
        {
            skill: Skill.CRAFTING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.CRAFTING),
        },
        {
            skill: Skill.FIREMAKING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FIREMAKING),
        },
        {
            skill: Skill.THIEVING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.THIEVING),
        },
        {
            skill: Skill.FORGING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FORGING),
        },
        {
            skill: Skill.FLETCHING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FLETCHING),
        },
        {
            skill: Skill.ALCHEMY,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.ALCHEMY),
        },
        {
            skill: Skill.FARMING,
            relevantAction: skillStore.getCurrentAndNextActionForSkill(Skill.FARMING),
        },
    ]
})

const actionsWithItemSearch = computed(() => {
    return allActions.value.filter((x) => x.relevantAction.hasItemSearch)
})

const landscape = (skill: Skill) => {
    return landscapeImage(String(skillNames[skill] ?? ""))
}

const hoursUntilNextAction = (relevantAction: RelevantAction) => {
    if (!relevantAction.nextAction) {
        return "0" // max level
    }
    const xpToNextAction = relevantAction.nextAction.minXP - relevantAction.currentXPForSkill
    return (
        xpToNextAction /
        (relevantAction.currentAction.xpPerHour *
            coreStore.getXPBoostMultiplier(relevantAction.skill, BoostType.NON_COMBAT_XP))
    ).toFixed(1)
}

const hoursUntilNextLevel20 = (relevantAction: RelevantAction) => {
    if (!relevantAction.nextAction) {
        return "0" // max level
    }
    const xpToNextAction = relevantAction.nextAction.minXP - relevantAction.currentXPForSkill
    // get xps of level 20, 40, 60, 80, 100
    const relevantXpBoundaries = [
        xpBoundaries[19],
        xpBoundaries[39],
        xpBoundaries[59],
        xpBoundaries[79],
        xpBoundaries[99],
    ]
    const nextXpBoundary =
        Math.min(...relevantXpBoundaries.filter((x) => x > relevantAction.currentXPForSkill)) || 0

    if (xpToNextAction < nextXpBoundary - relevantAction.currentXPForSkill) {
        return "0" // next upgrade action is closer than the level 20 boundary
    }
    return (
        (nextXpBoundary - relevantAction.currentXPForSkill) /
        (relevantAction.currentAction.xpPerHour *
            coreStore.getXPBoostMultiplier(relevantAction.skill, BoostType.NON_COMBAT_XP))
    ).toFixed(1)
}
</script>
