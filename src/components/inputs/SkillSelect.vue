<template>
    <label class="form-control w-full">
        <div class="label">
            <span class="text-sm">Skill</span>
        </div>
        <select class="select select-bordered w-full" v-model="value">
            <option v-for="o in options" :key="o" :value="o">
                {{ skillNames[o] || "" }}
            </option>
        </select>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { skillNames } from "../../store/skills"
import { Skill } from "@paintswap/estfor-definitions/types"

const emit = defineEmits(["update:modelValue"])

const options = [
    Skill.WOODCUTTING,
    Skill.MINING,
    Skill.SMITHING,
    Skill.FISHING,
    Skill.COOKING,
    Skill.CRAFTING,
    Skill.FIREMAKING,
    Skill.ALCHEMY,
    Skill.FORGING,
    Skill.FLETCHING,
    Skill.THIEVING,
    Skill.COMBAT,
    Skill.FARMING,
]

const props = defineProps({
    modelValue: {
        type: Number,
        default: undefined,
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
</script>
