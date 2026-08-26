<template>
    <label class="form-control w-full">
        <div class="label">
            <span class="text-sm">Queue Type</span>
        </div>
        <select class="select select-bordered w-full" v-model="value">
            <option v-for="o in options" :key="o" :value="o">
                {{ actionQueueStatusNames[o] || "" }}
            </option>
        </select>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { ActionQueueStrategy } from "@paintswap/estfor-definitions/types"

const emit = defineEmits(["update:modelValue"])

const actionQueueStatusNames = {
    [ActionQueueStrategy.APPEND]: "Append",
    [ActionQueueStrategy.KEEP_LAST_IN_PROGRESS]: "Keep Last In Progress",
    [ActionQueueStrategy.OVERWRITE]: "Replace",
}

const options = [
    // ActionQueueStatus.APPEND, // think this was deprecated for KEEP_LAST_IN_PROGRESS
    ActionQueueStrategy.KEEP_LAST_IN_PROGRESS,
    ActionQueueStrategy.OVERWRITE,
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
