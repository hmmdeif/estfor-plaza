<template>
    <label class="form-control">
        <div v-if="$props.label" class="label">
            <span class="text-sm">{{ props.label }}</span>
        </div>
        <select
            class="select select-bordered"
            :class="customClass"
            v-model="value"
        >
            <option v-for="o in options" :key="o" :value="o">
                {{ o }}
            </option>
        </select>
    </label>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { actionChoiceNames, actionNames } from "../../store/skills"
import { ProxySilo } from "../../store/models/factory.models"
import { safeDecode } from "../../store/core"

const emit = defineEmits(["update:modelValue"])

const props = defineProps({
    modelValue: {
        type: String,
        default: undefined,
    },
    heroes: {
        type: Array as () => ProxySilo[],
        required: true,
    },
    customClass: {
        type: String,
        default: "select-sm",
    },
    label: {
        type: String,
        default: "",
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

const options = computed(() => {
    return [
        "",
        ...props.heroes.map((h) => {
            const decoded = safeDecode(
                h.savedTransactions[0].data,
                "startActions"
            )
            const actionId = decoded?.[1]?.[0]?.[1] || BigInt(0)
            const choiceId = decoded?.[1]?.[0]?.[3] || BigInt(0)
            return (
                actionNames[Number(actionId)] ||
                actionChoiceNames[Number(choiceId)] ||
                "Unknown"
            )
        }),
        ...props.heroes
            .map((h) => {
                return h.queuedActions.map(
                    (q) =>
                        actionNames[Number(q.actionId)] ||
                        actionChoiceNames[Number(q.choice?.id)] ||
                        "Unknown"
                )
            })
            .flat(),
    ].filter((value, index, self) => {
        return self.findIndex((v) => v === value) === index
    })
})
</script>
