<template>
    <dialog id="ruby_brooch_paywall_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3
                v-if="emeraldBrooch.balance < 1 && brooch.balance < 1"
                class="font-bold text-lg text-center"
            >
                Sorry, you're not a member!
            </h3>
            <h3 v-else class="font-bold text-lg text-center">
                Ahh, a member of the Plaza!
            </h3>
            <p
                v-if="emeraldBrooch.balance >= 1 && brooch.balance < 1"
                class="my-5"
            >
                So you want to see what's in the Factory, eh? Well, I can't just
                let anyone in you know. You'll need to buy one of my Ruby
                brooches to get access. Here, give me your Emerald brooch and
                I'll give you a Ruby one for a small price.
            </p>
            <p
                v-if="emeraldBrooch.balance >= 1 && brooch.balance < 1"
                class="my-5"
            >
                This one increases in price just like the Emerald brooch.
            </p>
            <p
                v-if="emeraldBrooch.balance >= 1 && brooch.balance < 1"
                class="my-5"
            >
                The Factory is a place where you can create your own Estfor
                industrial workflow. If you have a Ruby brooch you can run your
                factory without charge!
            </p>
            <p v-else-if="brooch.balance >= 1" class="my-5">
                You already have access to use this feature. But feel free to
                buy another one of my brooches if you like...
                <span v-if="emeraldBrooch.balance < 1"
                    >Oh, you don't have any more Emerald Brooches, then you
                    can't have any more Ruby Brooches!</span
                >
            </p>
            <picture>
                <source srcset="/src/assets/optimized/ruby-brooch.avif" type="image/avif" />
                <img
                    src="/src/assets/optimized/ruby-brooch.webp"
                    class="rounded-lg mt-5"
                    alt="Ruby Brooch"
                    width="512"
                    height="512"
                    loading="lazy"
                    decoding="async"
                />
            </picture>
            <div class="flex mt-5">
                <button
                    v-if="!isApproved"
                    type="button"
                    class="btn btn-primary btn-lg grow sm:mr-5"
                    :disabled="loading"
                    @click.prevent="approve"
                >
                    Approve Emerald Brooch Transfer
                </button>
                <button
                    v-else
                    type="button"
                    class="btn btn-primary btn-lg grow sm:mr-5"
                    :disabled="loading || emeraldBrooch.balance < 1"
                    @click.prevent="mintNFT"
                >
                    Mint Ruby Brooch ({{ mintPrice }} S)
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

const loading = ref(false)
const isApproved = ref(false)

const emeraldBrooch = computed(() => {
    return broochStore.brooch(0)
})

const brooch = computed(() => {
    return broochStore.brooch(1)
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
            isApproved.value = (await broochStore.getApproval()) as boolean
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

    const dialog = document.getElementById(
        "ruby_brooch_paywall_modal"
    ) as HTMLDialogElement
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
        const hash = await broochStore.upgradeBrooch(1)
        await waitForTransactionReceipt(config, { hash, chainId: SONIC_CHAIN_ID })
        app.addToast("Thank you for your support!", "alert-success", 5000)
    } catch (error) {
        // app.addToast('Failed to mint brooch', 'alert-error', 50000)
        console.log(error)
    } finally {
        loading.value = false
        const dialog = document.getElementById(
            "ruby_brooch_paywall_modal"
        ) as HTMLDialogElement
        dialog.close()
        init()
    }
}

const approve = async () => {
    loading.value = true
    try {
        const hash = await broochStore.setApprovalForAll()
        await waitForTransactionReceipt(config, { hash, chainId: SONIC_CHAIN_ID })
        app.addToast("Transfer Approved", "alert-success", 5000)
    } catch (error) {
        // app.addToast('Failed to mint brooch', 'alert-error', 50000)
        console.log(error)
    } finally {
        loading.value = false
        init()
    }
}

defineExpose({
    openDialog,
})
</script>
