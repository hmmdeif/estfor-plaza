<template>
    <label class="form-control w-full">
        <div class="label">
            <span class="text-sm">Action</span>
        </div>
        <select class="select select-bordered w-full" v-model="value">
            <option v-for="o in options" :key="o.actionId" :value="o.actionId">
                {{ actionNames[o.actionId] || "" }}
            </option>
        </select>
        <div v-if="minHeroXPForSkill > 0" class="label">
            <span class="text-sm"
                >Minimum level of selected heroes:
                {{ getLevel(minHeroXPForSkill.toString()) }}
            </span>
        </div>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { actionNames, useSkillStore } from "../../store/skills"
import { calculateExtraXPForHeroActionInput } from "../../store/factory"
import { getLevel, skillToXPMap } from "../../store/core"
import { Skill } from "@paintswap/estfor-definitions/types"
import { ProxySilo } from "../../store/models/factory.models"

const skillStore = useSkillStore()

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    modelValue: {
        type: Number,
        default: undefined,
    },
    skillId: {
        type: Number,
        required: true,
    },
    heroes: {
        type: Array as () => ProxySilo[],
        required: true,
    },
})

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit("update:modelValue", value)
    },
})

const minHeroXPForSkill = computed(() => {
    if (props.skillId === Skill.COMBAT) return 0
    return Math.min(
        ...props.heroes.map((h) => {
            const { extraXP } = calculateExtraXPForHeroActionInput(
                h,
                props.skillId
            )

            // @ts-ignore
            return Number(h.playerState[skillToXPMap[props.skillId]]) + extraXP
        })
    )
})

const options = computed(() => {
    return skillStore
        .getActionInputsForSkill(props.skillId)
        .filter((s) => s.info.minXP <= minHeroXPForSkill.value && (s.info.actionChoiceRequired === false || s.info.skill === Skill.COMBAT) && s.info.isAvailable)
})
</script>
