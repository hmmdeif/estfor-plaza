import { defineStore } from "pinia"

export interface Toast {
    text: string
    timeout: number
    class: string
    id: number
}

export interface AppState {
    theme: string
    toasts: Toast[]
    id: number
    loadingRoute: boolean
    version: string
}

export const useAppStore = defineStore("app", {
    state: () =>
        ({
            theme: localStorage.getItem("theme") || "notheme",
            toasts: [],
            id: 0,
            loadingRoute: false,
            version: "0.0.2",
        }) as AppState,
    getters: {},
    actions: {
        setTheme(theme: string) {
            this.theme = theme
            localStorage.setItem("theme", theme)
        },
        addToast(message: string, classStr: string, timeout: number = 0) {
            const toast = {
                text: message,
                class: classStr,
                timeout,
                id: this.id,
            }
            this.toasts.push(toast)
            if (timeout > 0) {
                setTimeout(() => {
                    this.toasts.splice(
                        this.toasts.findIndex((x) => x.id === toast.id),
                        1
                    )
                }, timeout)
            }
            this.id++
            return toast.id
        },
        removeToast(id: number) {
            if (this.toasts.findIndex((x) => x.id === id) === -1) return
            this.toasts.splice(
                this.toasts.findIndex((x) => x.id === id),
                1
            )
        },
    },
})
