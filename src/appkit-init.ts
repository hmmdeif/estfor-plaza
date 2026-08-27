import { createAppKit, useAppKit } from "@reown/appkit/vue"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { disconnect, getAccount, watchAccount } from "@wagmi/core"
import { config, metadata, networks, projectId } from "./config"
import { markWalletReady, setWalletOpener, setWalletSession } from "./wallet-state"

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

setWalletOpener(() => useAppKit().open())

// Auto-reconnect of a persisted session can finish before this module is
// lazily evaluated, in which case watchAccount would never fire. Seed the
// bridge with the current snapshot first, then follow live changes.
const snapshot = getAccount(config)
setWalletSession(snapshot.isConnected, snapshot.address)
markWalletReady()

watchAccount(config, {
    onChange(account) {
        setWalletSession(account.status === "connected", account.address)
    },
})

// Safety net: AppKit's modal disconnect can silently skip the wagmi-level
// teardown (it bypasses the adapter while it hasn't synced a caipAddress),
// leaving wagmi connected while AppKit considers the session gone - which
// stranded users on the game screen. If AppKit reports a disconnected
// session that persists past a short grace period while wagmi still claims
// to be connected, force a real wagmi teardown and clear the bridge. The
// grace period ignores transient desyncs during boot/session restore.
let rescueTimer: number | undefined
modal.subscribeAccount(
    (account) => {
        if (!account.isConnected && getAccount(config).isConnected) {
            clearTimeout(rescueTimer)
            rescueTimer = window.setTimeout(() => {
                if (getAccount(config).isConnected) {
                    void disconnect(config).catch(() => {})
                    setWalletSession(false, undefined)
                }
            }, 800)
        } else {
            clearTimeout(rescueTimer)
        }
    },
    "eip155"
)
