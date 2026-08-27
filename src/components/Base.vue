<template>
    <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast toast-top toast-end"
    >
        <div class="alert text-white" :class="toast.class">
            <svg
                v-if="toast.class == 'alert-error'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
            </svg>
            <svg
                v-if="toast.class == 'alert-success'"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span>{{ toast.text }}</span>
        </div>
    </div>
    <div class="container mx-auto">
        <div v-if="route.meta.public">
            <RouterView />
        </div>
        <div
            v-else-if="!isConnected"
            class="card md:w-[500px] bg-base-100-50 shadow-xl mx-auto my-[100px] p-10"
        >
            <div class="text-center">
                <h2 class="text-2xl font-bold">
                    Welcome to Deif's Estfor Plaza!
                </h2>
                <p class="text-lg my-5">
                    Here you'll find all the information about the Kingdom and
                    its inhabitants.
                </p>
                <p class="text-lg my-5">
                    Maybe you wish to know how long you can survive against the
                    frightening Obgora, or how many hours of mastering smithing
                    Adamantine Shields will unlock the knowledge to craft Runite
                    armour? Then enter the Plaza, friend, you're in good
                    company.
                </p>
                <p class="text-lg">Connect your wallet below</p>
            </div>
            <div class="text-center my-4">
                <button class="btn btn-primary" @click="open()">
                    Connect Wallet
                </button>
            </div>
        </div>
        <div
            v-else-if="
                loading ||
                app.loadingRoute ||
                (!isConnected && !walletReady && shouldRestoreSession())
            "
            class="mx-auto my-[100px] w-[500px] text-center"
        >
            <span
                class="loading loading-spinner text-primary loading-md mx-auto"
            ></span>
        </div>
        <div
            v-else-if="coreStore.playerId == '0'"
            class="card md:w-[500px] bg-base-100-50 shadow-xl mx-auto my-[100px] p-10"
        >
            <div class="text-center">
                <h2 class="text-2xl font-bold">
                    Sorry friend, but I don't recognise you!
                </h2>
                <p class="text-lg my-5">
                    Do not worry as you can register for free, just click the
                    button below then return here once you're all set up.
                </p>
            </div>
            <div class="text-center my-4">
                <a href="https://estfor.com" target="_blank">
                    <button class="btn btn-primary">
                        Go to Estfor Kingdom
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-6 h-6"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                        </svg>
                    </button>
                </a>
            </div>
        </div>
        <div v-else>
            <RouterView />
        </div>
    </div>
</template>

<script setup lang="ts">
import { getAccount } from "@wagmi/core"
import { computed, onMounted, ref, watch } from "vue"
import { useCoreStore } from "../store/core"
import { useAppStore } from "../store/app"
import { useBroochStore } from "../store/brooch"
import { config } from "../config"
import { bootWallet, shouldRestoreSession, walletReady, walletState } from "../wallet-state"
import { useRoute } from "vue-router"
import { sleep } from "../utils/time";

const coreStore = useCoreStore()
const broochStore = useBroochStore()
const app = useAppStore()
const loading = ref(false)
const open = () => walletState.open()

const toasts = computed(() => app.toasts)
const isConnected = computed(() => walletState.isConnected.value)
const route = useRoute()

const init = async () => {
    try {
        // Only wait for the lazily-booted wallet stack when a stored session
        // may need restoring; fresh visitors must not force the boot here.
        if (shouldRestoreSession()) await bootWallet()
        const account = getAccount(config)
        if (account.isConnecting || account.isReconnecting) {
            await sleep(1000)
            return await init()
        }
        if (account.isConnected) {
            loading.value = true
            await coreStore.getActivePlayer()
            await broochStore.getBroochData(0, false)
            await broochStore.getBroochData(1, true)
        } else if (account.isDisconnected) {
            coreStore.disconnect()
        }
    } catch (e) {
        console.log(e)
    } finally {
        loading.value = false
    }
}

onMounted(init)

watch(walletState.address, init)
</script>

<style>
.toast {
    z-index: 99999 !important;
}
</style>
