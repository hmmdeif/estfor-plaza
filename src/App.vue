<script setup lang="ts">
import { onMounted, provide } from "vue"
import { useAppStore } from "./store/app"
import Header from "./components/layout/Header.vue"
import { reconnect } from "@wagmi/core"
import { config, wagmiAdapter, metadata } from "./config"
import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
} from "@apollo/client/core"
import { ApolloClients } from "@vue/apollo-composable"
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

// HTTP connection to the API
const httpLink = createHttpLink({
    // You should use an absolute URL here
    uri: import.meta.env.VITE_SUBGRAPH_URL,
})

// Cache implementation
const cache = new InMemoryCache()
const sonicCache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
})

const sonicHttpLink = createHttpLink({
    uri: import.meta.env.VITE_SONIC_SUBGRAPH_URL,
})

const sonicApolloClient = new ApolloClient({
    link: sonicHttpLink,
    cache: sonicCache,
})

provide(ApolloClients, {
    default: apolloClient, 
    sonic: sonicApolloClient,
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
