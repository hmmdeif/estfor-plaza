import { ref } from "vue"

// Reactive bridge between the app and the lazily loaded AppKit stack.
export const walletReady = ref(false)

export const walletState = {
    isConnected: ref(false),
    address: ref<string | undefined>(),
    open: async () => {
        const wallet = await loadWallet()
        await wallet.open()
    },
}

/** Called by appkit-init.ts to mirror Wagmi account state into the app. */
export function setWalletSession(isConnected: boolean, address?: string) {
    walletState.isConnected.value = isConnected
    walletState.address.value = isConnected ? address : undefined
}

type WalletModule = typeof import("./appkit-init")
let walletModule: Promise<WalletModule> | undefined

const loadWallet = () => (walletModule ??= import("./appkit-init"))

/** Loads AppKit once and waits for connector setup and session restoration. */
export async function bootWallet(): Promise<void> {
    const wallet = await loadWallet()
    await wallet.ready
}

/** AppKit's persisted status is the authoritative hint that reconnect is needed. */
export const shouldRestoreSession =
    localStorage.getItem("@appkit/connection_status") === "connected"

const bootInBackground = () => {
    void bootWallet().catch((error) => {
        console.warn("Unable to initialise wallet support", error)
    })
}

if (shouldRestoreSession) {
    bootInBackground()
} else {
    let idleCallbackId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const scheduleBoot = () => {
        window.removeEventListener("pointerdown", scheduleBoot, true)
        window.removeEventListener("keydown", scheduleBoot, true)

        if (idleCallbackId !== undefined) {
            window.cancelIdleCallback(idleCallbackId)
        }
        if (timeoutId !== undefined) clearTimeout(timeoutId)

        bootInBackground()
    }

    window.addEventListener("pointerdown", scheduleBoot, {
        once: true,
        capture: true,
    })
    window.addEventListener("keydown", scheduleBoot, {
        once: true,
        capture: true,
    })

    if ("requestIdleCallback" in window) {
        idleCallbackId = window.requestIdleCallback(scheduleBoot, {
            timeout: 1500,
        })
    } else {
        timeoutId = setTimeout(scheduleBoot, 1500)
    }
}
