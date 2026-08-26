<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">Deposit Heroes</h3>

            <div class="mt-5">
                For depositing heroes into empty silos from your wallet. Leave the Assigned Silo blank to keep them in your wallet.
            </div>       
            
            <button class="btn btn-primary mt-5 w-full" @click="autoFillSilos">Auto-fill</button>

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th>Hero</th>
                            <th class="text-right">Assigned Silo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="h in heroes" :key="h.playerId">
                            <td>{{ h.name }}</td>
                            <td class="text-right">
                                <input
                                    class="input input-bordered w-full bg-base-100-50 input-sm"
                                    v-model="h.assignedSilo"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="error" class="mt-5 text-error">
                {{ error }}
            </div>

            <div class="mt-5">
                There will be multiple transactions to complete this process:
                <ol class="list-decimal list-inside">
                    <li>
                        Approve the bank to transfer your heroes
                    </li>
                    <li>
                        Deposit heroes into empty silos
                    </li>
                    <li>
                        Activate heroes on each silo
                    </li>
                </ol>                
            </div>
            <div class="mt-5">
                If you cannot access the Plaza after this process, you probably transferred your active hero to a silo. Go to Estfor and activate your main hero there.
            </div>

            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="depositHeroes"
                :disabled="loading || heroesToBeAssigned.length === 0"
            >
                Deposit {{ heroesToBeAssigned.length }} Hero{{
                    heroesToBeAssigned.length === 1 ? "" : "s"
                }}
            </button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useFactoryStore } from "../../store/factory"
import { useAppStore } from "../../store/app"
import { getPlayersByOwner } from "../../utils/api"
import { getAccount } from "@wagmi/core"
import { config, type SonicChainId } from "../../config"
import { getAddress } from "viem"

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

const emits = defineEmits(["deposited"])

const heroes = ref<HeroWithSiloAddress[]>([])
const error = ref<string | null>(null)

const factoryStore = useFactoryStore()
const app = useAppStore()

interface HeroWithSiloAddress {
    playerId: string
    assignedSilo: string
    name: string
}

const loading = ref(false)

const heroesToBeAssigned = computed(() => {
    return heroes.value.filter((h) => h.assignedSilo?.length > 0)
})

const openDialog = async () => {
    error.value = null
    heroes.value = []

    const account = getAccount(config)
    const heroesResult = await getPlayersByOwner(account.address as string)
    heroes.value = heroesResult.players.map((p) => ({
        playerId: p.id,
        name: p.name,
        assignedSilo: "",
    }))
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const autoFillSilos = () => {
    // get empty silos
    const emptySilos = factoryStore.emptyProxys
    heroes.value = heroes.value.map((h, i) => ({
        ...h,
        assignedSilo: emptySilos[i]?.address || "",
    }))
}

const depositHeroes = async () => {
    loading.value = true
    error.value = null
    try {
        await factoryStore.depositHeroes(
            heroes.value
                .filter((i) => i.assignedSilo?.length > 0)
                .map((i) => ({
                    playerId: i.playerId,
                    assignedSilo: getAddress(i.assignedSilo),
                })),
            props.chainId as SonicChainId
        )
        app.addToast(`Heroes deposited`, "alert-success", 5000)
        emits("deposited")
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
    } catch (e: any) {
        console.error(e)
        if (e.message?.indexOf("User rejected the request") > -1) {
            return
        }
        error.value =
            "Could not create a transaction."
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
