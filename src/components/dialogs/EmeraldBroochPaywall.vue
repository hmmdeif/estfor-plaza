<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3
                v-if="!broochStore.hasAccess(0)"
                class="font-bold text-lg text-center"
            >
                Sorry, you're not a member!
            </h3>
            <h3 v-else class="font-bold text-lg text-center">
                Ahh, a member of the Plaza!
            </h3>
            <p v-if="!broochStore.hasAccess(0)" class="my-5">
                This information doesn't come free you know, I have eggs to
                incubate and fires to upkeep! Now why don't you buy one of my
                Emerald brooches and you can get basic access to the Plaza?
            </p>
            <p v-if="!broochStore.hasAccess(0)" class="my-5">
                It's better to buy them early because I increase the price after
                each one sold!
            </p>
            <p v-else class="my-5">
                You already have access to use this feature. But feel free to
                buy another one of my brooches if you like...
            </p>
            <img
                src="/src/assets/emerald_brooch_web.png"
                class="rounded-lg"
                alt="Emerald Brooch"
            />
            <div class="flex mt-5">
                <button
                    type="button"
                    class="btn btn-primary btn-lg grow sm:mr-5"
                    :disabled="loading"
                    @click.prevent="mintNFT"
                >
                    Mint Emerald Brooch ({{ mintPrice }} S)
                </button>
                <a
                    href="https://paintswap.io/sonic/collections/deif's-quality-brooches/nfts"
                    target="_blank"
                    class="max-sm:hidden"
                    ><button type="button" class="btn btn-primary btn-lg">
                        View NFT
                    </button></a
                >
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { getAccount, waitForTransactionReceipt, switchChain } from "@wagmi/core"
import { useAppStore } from "../../store/app"
import { useBroochStore } from "../../store/brooch"
import { config, SONIC_CHAIN_ID } from "../../config"

const app = useAppStore()
const broochStore = useBroochStore()

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
})

const loading = ref(false)

const brooch = computed(() => {
    return broochStore.brooch(0)
})

const init = async () => {
    try {
        const account = getAccount(config)
        if (account.isConnected) {
            if (account.chainId !== SONIC_CHAIN_ID) {
                switchChain(config, { chainId: SONIC_CHAIN_ID })
            }
            loading.value = true
            await broochStore.getBroochData(0, false)
            await broochStore.getBroochData(1, true)
        }
    } finally {
        loading.value = false
    }
}

const openDialog = (_monsterId: number) => {
    const account = getAccount(config)
    if (account.isDisconnected) {
        return
    }

    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
    init()
}

const mintPrice = computed(() => {
    return (
        (BigInt(brooch.value.totalSupply) * BigInt(10 ** 18) +
            BigInt(brooch.value.baseTokenPrice)) /
        BigInt(10 ** 18)
    )
})

const mintNFT = async () => {
    loading.value = true
    try {
        const hash = await broochStore.mintNFT(0)
        await waitForTransactionReceipt(config, { hash, chainId: SONIC_CHAIN_ID })
        app.addToast("Thank you for your support!", "alert-success", 5000)
    } catch (error) {
        // app.addToast('Failed to mint brooch', 'alert-error', 50000)
        console.log(error)
    } finally {
        loading.value = false
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
        init()
    }
}

defineExpose({
    openDialog,
})
</script>
