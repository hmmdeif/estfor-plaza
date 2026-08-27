import { ref } from "vue"

// Reactive bridge between the app and the lazily-booted AppKit stack
// (see appkit-init.ts). Keeping AppKit/WalletConnect out of the module
// graph until bootWallet() runs is what keeps the initial bundle small.

let openModal: () => void = () => {}

/** False until appkit-init.ts has evaluated and seeded walletState. */
export const walletReady = ref(false)

export function markWalletReady() {
    walletReady.value = true
}

export const walletState = {
    isConnected: ref(false),
    address: ref<string | undefined>(undefined),
    /** Boots the wallet stack first if needed, then opens the connect modal. */
    open: async () => {
        await bootWallet()
        openModal()
    },
}

/** Called by appkit-init.ts once the AppKit client exists. */
export function setWalletOpener(opener: () => void) {
    openModal = opener
}

/** Called by appkit-init.ts to mirror wagmi account state into the app. */
export function setWalletSession(isConnected: boolean, address?: string) {
    walletState.isConnected.value = isConnected
    walletState.address.value = address
}

let bootPromise: Promise<unknown> | undefined

/** Loads and initialises appkit-init.ts exactly once. */
export function bootWallet(): Promise<unknown> {
    if (!bootPromise) {
        bootPromise = import("./appkit-init")
    }
    return bootPromise
}

const hasPersistedSession = () =>
    Object.keys(localStorage).some((k) => /(wc@|wagmi|appkit|w3m)/i.test(k))

/** True when localStorage hints at a previous wallet connection. */
export const shouldRestoreSession = hasPersistedSession

if (hasPersistedSession()) {
    void bootWallet()
} else {
    const schedule = () => void bootWallet()
    window.addEventListener("pointerdown", schedule, { once: true, capture: true })
    window.addEventListener("keydown", schedule, { once: true, capture: true })
    const idle = (cb: () => void) =>
        "requestIdleCallback" in window
            ? requestIdleCallback(cb, { timeout: 1500 })
            : setTimeout(cb, 1500)
    idle(schedule)
}
