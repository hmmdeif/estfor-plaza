<script setup lang="ts">
import { onMounted } from "vue"
import { useAppStore } from "./store/app"
import Header from "./components/layout/Header.vue"
import { createAppKit } from "@reown/appkit/vue"
import { metadata, networks, projectId, wagmiAdapter } from "./config"

const appStore = useAppStore()

const setPreferredColorScheme = () => {
    appStore.setTheme("dark")
}

onMounted(() => {
    setPreferredColorScheme()
})

createAppKit({
    adapters: [wagmiAdapter],
    defaultNetwork: networks[0],
    projectId,
    networks,
    metadata,
    features: {
        email: false,
        socials: false,
        swaps: false,
        onramp: false,
    },
    excludeWalletIds: ["19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927"],
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
