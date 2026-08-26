<script setup lang="ts">
import { onMounted } from "vue"
import { useAppStore } from "./store/app"
import Header from "./components/layout/Header.vue"
import { reconnect } from "@wagmi/core"
import { config, wagmiAdapter, metadata } from "./config"

 import { createAppKit } from '@reown/appkit/vue' 
import { sonic } from "viem/chains"

const appStore = useAppStore()

const setPreferredColorScheme = () => {
    appStore.setTheme("dark")
}

onMounted(() => {
    setPreferredColorScheme()
})

const projectId = import.meta.env.VITE_PROJECT_ID

reconnect(config)

createAppKit({
    adapters: [wagmiAdapter],
    defaultNetwork: sonic,
    projectId,
    networks: [sonic],
    metadata,
    excludeWalletIds: [
        "19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927",
    ],
    themeMode: "dark",
    themeVariables: {
        "--w3m-accent": "#214850",
    },
})


</script>

<template>
    <div class="app overflow-y-auto">
        <Header />
        <RouterView />
    </div>
</template>

<style>
.app {
    position: fixed;
    height: 100%;
    width: 100%;
    background-image: url("https://media.estfor.com/landscape/mining.jpg");
    background-position: center;
    background-size: cover;
}
</style>
