import { createAppKit } from "@reown/appkit/vue"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { disconnect, getAccount, watchAccount } from "@wagmi/core"
import { config, metadata, networks, projectId } from "./config"
import { setWalletSession, walletReady } from "./wallet-state"

// Loaded on demand via wallet-state.ts so the WalletConnect stack and the
// WagmiAdapter never load with the initial page.

const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    wagmiConfig: config,
})

const modal = createAppKit({
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
        analytics: false,
        send: false,
        receive: false,
    },
    enableCoinbase: false,
    enableBaseAccount: false,
    enableAuthLogger: false,
    enableWalletGuide: false,
    excludeWalletIds: ["19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927"],
    themeMode: "dark",
    themeVariables: {
        "--w3m-accent": "#214850",
    },
})

const syncWalletSession = () => {
    const account = getAccount(config)
    setWalletSession(account.isConnected, account.address)
}

// AppKit owns connector setup, but the rest of the app uses the shared Wagmi
// config directly. Mirror that config so both sides always observe one session.
watchAccount(config, { onChange: syncWalletSession })

export const ready = modal.ready().then(() => {
    syncWalletSession()
    walletReady.value = true

    // AppKit 1.8 can clear its account before delegating disconnect to Wagmi.
    // If delegation is skipped, reconcile the two after the normal disconnect
    // path has had time to finish.
    let rescueTimer: number | undefined
    modal.subscribeAccount((account) => {
        window.clearTimeout(rescueTimer)

        if (!account.isConnected && getAccount(config).isConnected) {
            rescueTimer = window.setTimeout(() => {
                if (getAccount(config).isConnected) {
                    void disconnect(config).catch((error) => {
                        console.warn("Unable to reconcile wallet disconnect", error)
                    })
                }
            }, 800)
        }
    }, "eip155")
})

export async function open() {
    await ready
    await modal.open()
}
