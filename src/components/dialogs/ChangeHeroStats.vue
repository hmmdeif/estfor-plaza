<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">Change Hero Stats</h3>

            <label class="form-control w-full">
                <div class="label">
                    <span class="text-sm">Melee</span>
                </div>
                <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    class="input input-bordered w-full"
                    v-model="meleeLevel"
                />
            </label>

            <label class="form-control w-full">
                <div class="label">
                    <span class="text-sm">Ranged</span>
                </div>
                <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    class="input input-bordered w-full"
                    v-model="rangedLevel"
                />
            </label>

            <label class="form-control w-full">
                <div class="label">
                    <span class="text-sm">Magic</span>
                </div>
                <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    class="input input-bordered w-full"
                    v-model="magicLevel"
                />
            </label>

            <label class="form-control w-full">
                <div class="label">
                    <span class="text-sm">Defence</span>
                </div>
                <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    class="input input-bordered w-full"
                    v-model="defenceLevel"
                />
            </label>

            <div class="flex mt-5">
                <button
                    type="button"
                    class="btn btn-primary w-full grow sm:mr-5"
                    @click.prevent="reset"
                >
                    Reset
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { getAccount } from "@wagmi/core"
import { useCoreStore, getLevel, xpBoundaries } from "../../store/core"
import { ref, watch } from "vue"
import { config } from "../../config"

const coreStore = useCoreStore()

const meleeLevel = ref(getLevel(coreStore.playerState?.meleeXP))
const rangedLevel = ref(getLevel(coreStore.playerState?.rangedXP))
const magicLevel = ref(getLevel(coreStore.playerState?.magicXP))
const defenceLevel = ref(getLevel(coreStore.playerState?.defenceXP))

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const openDialog = (_monsterId: number) => {
    const account = getAccount(config)
    if (account.isDisconnected) {
        return
    }

    meleeLevel.value = getLevel(coreStore.playerState?.meleeXP)
    rangedLevel.value = getLevel(coreStore.playerState?.rangedXP)
    magicLevel.value = getLevel(coreStore.playerState?.magicXP)
    defenceLevel.value = getLevel(coreStore.playerState?.defenceXP)

    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const reset = () => {
    coreStore.resetPlayerState()
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.close()
}

watch([meleeLevel, rangedLevel, magicLevel, defenceLevel], () => {
    coreStore.playerState.meleeXP = (
        xpBoundaries[meleeLevel.value - 1] || 1
    ).toString()
    coreStore.playerState.rangedXP = (
        xpBoundaries[rangedLevel.value - 1] || 1
    ).toString()
    coreStore.playerState.magicXP = (
        xpBoundaries[magicLevel.value - 1] || 1
    ).toString()
    coreStore.playerState.defenceXP = (
        xpBoundaries[defenceLevel.value - 1] || 1
    ).toString()
})

defineExpose({
    openDialog,
})
</script>
