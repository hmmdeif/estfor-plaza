import { injected, walletConnect } from "@wagmi/connectors"
import { http, fallback } from "@wagmi/core"
import { sonic } from "@wagmi/core/chains"
  import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

export const metadata = {
    name: "Deif's Estfor Plaza",
    description: "",
    url: "https://hmmdeif.github.io/estfor-plaza/",
    icons: [],
}

const projectId = import.meta.env.VITE_PROJECT_ID

export const wagmiAdapter = new WagmiAdapter({
    networks: [sonic],
    projectId,
    connectors: [
        walletConnect({ projectId, metadata }),
        injected({ shimDisconnect: true }),
    ],
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

export const config = wagmiAdapter.wagmiConfig;