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
    background-image: url("./assets/optimized/background/mining-960.webp");
    background-image: image-set(
        url("./assets/optimized/background/mining-960.avif") type("image/avif"),
        url("./assets/optimized/background/mining-960.webp") type("image/webp")
    );
    background-position: center;
    background-size: cover;
}

@media (min-width: 960px) {
    .app {
        background-image: url("./assets/optimized/background/mining-1280.webp");
        background-image: image-set(
            url("./assets/optimized/background/mining-1280.avif") type("image/avif"),
            url("./assets/optimized/background/mining-1280.webp") type("image/webp")
        );
    }
}

@media (min-width: 1440px) {
    .app {
        background-image: url("./assets/optimized/background/mining-1920.webp");
        background-image: image-set(
            url("./assets/optimized/background/mining-1920.avif") type("image/avif"),
            url("./assets/optimized/background/mining-1920.webp") type("image/webp")
        );
    }
}
</style>
