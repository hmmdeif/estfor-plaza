<template>
    <label class="form-control w-full">
        <div class="label">
            <span class="text-sm">Advanced Action</span>
        </div>
        <select class="select select-bordered w-full" v-model="value">
            <option v-for="o in options" :key="o" :value="o">
                {{ actionChoiceNames[o] || "" }}
            </option>
        </select>
        <div class="label">
            <span class="text-sm"
                >Minimum level of selected heroes:
                {{ getLevel(minHeroXPForSkill.toString()) }}
            </span>
        </div>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { actionChoiceNames, useSkillStore } from "../../store/skills"
import { calculateExtraXPForHeroActionChoiceInput } from "../../store/factory"
import { getLevel, skillToXPMap } from "../../store/core"
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
    return Math.min(
        ...props.heroes.map((h) => {
            const extraXP = calculateExtraXPForHeroActionChoiceInput(
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
        .getActionChoiceInputsForSkill(props.skillId)
        .filter((_, i) => {
            const action = skillStore.getActionChoicesForSkill(props.skillId)[i]
            return (
                action.skillMinXPs.length === 0 ||
                action.skillMinXPs[action.skills.indexOf(props.skillId)] <=
                    minHeroXPForSkill.value
            )
        })
})
</script>
