<template>
    <div class="flex items-center justify-center flex-col">
        <div
            class="border-2 bg-base-100-50 border-solid rounded-lg border-primary w-full text-center p-5 my-5"
        >
            {{ props.name }}
        </div>
        <picture>
            <source v-if="avatarSource?.avif" type="image/avif" :srcset="avatarSource.avif" />
            <img
                v-if="avatarSource?.fallback"
                :src="avatarSource.fallback"
                class="rounded-lg border-solid border-2 border-primary"
            />
        </picture>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { characterImage } from "../utils/media"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false,
        default: "",
    },
})

const avatarSource = computed(() => {
    return characterImage(props.id)
})
</script>

<style scoped>
img {
    object-fit: contain;
    height: auto;
    width: 100%;
}
</style>
