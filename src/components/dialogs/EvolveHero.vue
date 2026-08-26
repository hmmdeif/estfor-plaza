<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                Evolve {{ heroesToEvolve.length }} Hero{{
                    heroesToEvolve.length === 1 ? "" : "es"
                }}
            </h3>

            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="approveBrush"
                :disabled="loading || approved"
            >
                1. Approve
                {{ (Number(cost) / 10 ** 18) * heroesToEvolve.length }} BRUSH
            </button>
            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="sendBrush"
                :disabled="loading || sentBrush"
            >
                2. Send
                {{ (Number(cost) / 10 ** 18) * heroesToEvolve.length }} BRUSH
            </button>
            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="evolveHeroes"
                :disabled="loading"
            >
                3. Evolve {{ heroesToEvolve.length }} Hero{{
                    heroesToEvolve.length === 1 ? "" : "es"
                }}
            </button>
            <div
                v-if="loading && factoryStore.currentTransactionNumber > 0"
                class="mt-5"
            >
                Executing
                <span class="text-success">{{
                    factoryStore.currentTransactionNumber
                }}</span>
                of
                <span class="text-success">{{
                    factoryStore.totalTransactionNumber
                }}</span>
                transactions
            </div>
            <div v-else-if="loading" class="mt-5">
                Calculating transactions... Please wait
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useFactoryStore } from "../../store/factory"
import { useAppStore } from "../../store/app"
import { useCoreStore } from "../../store/core"
import { ProxySilo } from "../../store/models/factory.models"
import type { SonicChainId } from "../../config"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    chainId: {
        type: Number,
        required: true,
    },
})

const factoryStore = useFactoryStore()
const coreStore = useCoreStore()
const app = useAppStore()

const loading = ref(false)
const approved = ref(false)
const sentBrush = ref(false)
const cost = ref("0")
const heroesToEvolve = ref<ProxySilo[]>([])

const openDialog = async (heroes: ProxySilo[]) => {
    heroesToEvolve.value = heroes
    cost.value = coreStore.coreData.playerUpgradeCost
    approved.value = false
    sentBrush.value = false
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const approveBrush = async () => {
    loading.value = true
    try {
        await factoryStore.approveBrush(
            heroesToEvolve.value,
            BigInt(cost.value),
            props.chainId as SonicChainId
        )
        approved.value = true
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

const sendBrush = async () => {
    loading.value = true
    try {
        await factoryStore.sendBrush(
            heroesToEvolve.value,
            BigInt(cost.value),
            props.chainId as SonicChainId
        )
        sentBrush.value = true
    } catch {
        // console.log(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

const evolveHeroes = async () => {
    loading.value = true
    try {
        await factoryStore.evolveHeroes(
            heroesToEvolve.value,
            props.chainId as SonicChainId
        )

        app.addToast(
            `${heroesToEvolve.value.length} hero${
                heroesToEvolve.value.length !== 1 ? "es" : ""
            } evolved`,
            "alert-success",
            5000
        )
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
