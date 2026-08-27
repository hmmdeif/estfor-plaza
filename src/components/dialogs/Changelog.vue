<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                Changelog
            </h3>

            <div class="changelog-content">
                <div class="changelog-item">
                    <div class="changelog-item-title mb-2 text-lg font-bold">
                        v0.0.3
                    </div>
                    <div class="changelog-item-content">
                        <ul class="list-disc list-inside mb-2">
                            <li>Added Anniversary 3 items</li>
                            <li>Optimised site loading, images, dependencies, and initial bundle size</li>
                        </ul>
                    </div>
                </div>
                <div class="changelog-item">
                    <div class="changelog-item-title mb-2 text-lg font-bold">
                        v0.0.2
                    </div>
                    <div class="changelog-item-content">
                        <ul class="list-disc list-inside mb-2">
                            <li>Added a changelog dialog to see what's new</li>
                            <li>Anniversary update</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const openDialog = async () => {
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog,
})
</script>
