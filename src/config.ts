import { sonic } from "@reown/appkit/networks"
import { createConfig, fallback, http } from "@wagmi/core"
import logoUrl from "./assets/optimized/logo-256.webp"

export const projectId = import.meta.env.VITE_PROJECT_ID

if (!projectId) {
    throw new Error("VITE_PROJECT_ID is required")
}

export const networks: [typeof sonic] = [sonic]
export const SONIC_CHAIN_ID = sonic.id
export type SonicChainId = typeof SONIC_CHAIN_ID

export const metadata = {
    name: "Deif's Estfor Plaza",
    description: "Tools and information for Estfor Kingdom players.",
    url: window.location.origin,
    icons: [logoUrl],
}

// Plain wagmi config, kept free of AppKit imports so stores can use it
// before the wallet stack (WalletConnect etc.) is lazily booted. The
// WagmiAdapter in appkit-init.ts reuses this exact instance.
export const config = createConfig({
    chains: [sonic],
    transports: {
        [sonic.id]: fallback(
            [
                http("https://sonic.drpc.org"),
                http("https://rpc.soniclabs.com"),
                http("https://sonic-rpc.publicnode.com"),
            ],
            { rank: { interval: 120_000 } }
        ),
    },
})
