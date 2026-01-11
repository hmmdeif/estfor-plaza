<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                Assign {{ heroesToAssign.length }} Quest{{
                    heroesToAssign.length === 1 ? "" : "s"
                }}
            </h3>

            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="assignHeroes"
                :disabled="
                    loading || (questId === 0)
                "
            >
                Assign {{ heroesToAssign.length }} Quest{{
                    heroesToAssign.length === 1 ? "" : "s"
                }}
            </button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useSkillStore } from "../../store/skills"
import {
    useItemStore,
} from "../../store/items"
import {
    useFactoryStore,
} from "../../store/factory"
import { useAppStore } from "../../store/app"
import { allQuests } from "../../data/quests"
import { skillToXPMap } from "../../store/core"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { ProxySilo } from "../../store/models/factory.models"
import { getPlayerQuests } from "../../utils/api"
import { PlayerQuest } from "@paintswap/estfor-definitions/types"

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

const questId = ref(0)
const skillStore = useSkillStore()
const factoryStore = useFactoryStore()
const app = useAppStore()

const loading = ref(false)
const heroesToAssign = ref<ProxySilo[]>([])
const completedQuests = ref<PlayerQuest[]>([])

const openDialog = async (heroes: ProxySilo[]) => {
    heroesToAssign.value = heroes

    const promises = []
    for (const hero of heroesToAssign.value) {
        promises.push(getPlayerQuests(hero.playerId))
    }
    const playerQuests = await Promise.all(promises)
    for (const quests of playerQuests) {
        completedQuests.value.push(...quests.playerQuests)
    }

    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const assignHeroes = async () => {
    loading.value = true
    try {

        app.addToast(
            `${heroesToAssign.value.length} hero${
                heroesToAssign.value.length !== 1 ? "es" : ""
            } assigned`,
            "alert-success",
            5000
        )
        questId.value = 0
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
