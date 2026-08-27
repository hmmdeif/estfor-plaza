<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue"
import { getAccount } from "@wagmi/core"
import Donate from "../dialogs/Donate.vue"
import RubyBroochPaywall from "../dialogs/RubyBroochPaywall.vue"
import { useRoute } from "vue-router"
import { useBroochStore } from "../../store/brooch"
import { config } from "../../config"
import { useAppStore } from "../../store/app"
import Changelog from "../dialogs/Changelog.vue"

const broochStore = useBroochStore()
const appStore = useAppStore()

const HeaderItemSearch = defineAsyncComponent(() => import("./HeaderItemSearch.vue"))

const route = useRoute()
const broochTimeout = ref<number>(0)

const donateRef = ref<typeof Donate>()
const rubyUpgradeRef = ref<typeof RubyBroochPaywall>()
const changelogRef = ref<typeof Changelog>()

const lastChecked = ref(localStorage.getItem("lastChecked"))

const onNotificationClick = () => {
    localStorage.setItem("lastChecked", appStore.version)
    lastChecked.value = appStore.version
    changelogRef.value?.openDialog()
}

const showBrooch = (tokenId: number) => {
    let hasBrooch = false
    let checkTokenId = tokenId
    while (checkTokenId <= 1) {
        // higher tokenId means higher tier brooch so let them in - update when more brooches are added
        if (broochStore.brooch(checkTokenId).balance > 0) {
            hasBrooch = true
            break
        }
        checkTokenId++
    }

    if (!hasBrooch) {
        switch (tokenId) {
            case 0:
                donateRef.value?.openDialog()
                return
            case 1:
                if (broochStore.brooch(0).balance === 0) {
                    donateRef.value?.openDialog()
                    return
                }
                rubyUpgradeRef.value?.openDialog()
                return
        }
    }
}

const removeFocus = () => {
    const el = document.getElementById("md-plaza")
    if (el) {
        el.removeAttribute("open")
    }
    const smel = document.getElementById("sm-plaza")
    if (smel) {
        smel.removeAttribute("open")
    }
}

const init = async () => {
    try {
        window.clearTimeout(broochTimeout.value)
        const account = getAccount(config)
        if (account.isConnected) {
            if (!broochStore.hasAccess(0)) {
                broochTimeout.value = window.setTimeout(() => {
                    donateRef.value?.openDialog()
                }, 60000 * 5) // 5 minutes
            }
        }
    } catch (e) {
        console.error(e)
    }
}

watch(() => broochStore.hasAccess(0), init)
</script>

<template>
    <nav class="navbar bg-base-100-50 border-solid border-b-2 border-primary">
        <div class="navbar-start">
            <img
                width="46"
                height="46"
                src="/src/assets/optimized/logo-96.webp"
                class="ml-2 cursor-pointer"
                alt="Estfor Plaza"
                decoding="async"
                @click.prevent="donateRef?.openDialog()"
            />
            <router-link
                @click="removeFocus"
                to="/hero-select"
                class="max-md:hidden btn btn-ghost mr-2 ml-2"
                >Hero Select</router-link
            >
            <span class="max-md:hidden">|</span>
            <ul class="menu menu-horizontal max-md:hidden">
                <li>
                    <details id="md-plaza">
                        <summary>The Plaza</summary>
                        <ul class="bg-base-100 z-[1] w-56">
                            <li>
                                <details>
                                    <summary>Hero Management</summary>
                                    <ul>
                                        <li @click="removeFocus">
                                            <router-link to="/combat"
                                                >Combat Calculator</router-link
                                            >
                                        </li>
                                        <li @click="removeFocus">
                                            <router-link to="/skills">Skill Training</router-link>
                                        </li>
                                        <li @click="removeFocus">
                                            <router-link to="/lotteries"
                                                >Wishing Well Ranking</router-link
                                            >
                                        </li>
                                        <li @click="removeFocus">
                                            <router-link to="/vrf-actions" @click="showBrooch(0)"
                                                >VRF Actions
                                                <img
                                                    src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                                                    class="rounded-lg w-[20px] inline cursor-pointer"
                                                    alt="Emerald Brooch"
                                            /></router-link>
                                        </li>
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <details>
                                    <summary>
                                        Battles
                                        <img
                                            src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                                            class="rounded-lg w-[20px] inline cursor-pointer"
                                            alt="Emerald Brooch"
                                        />
                                    </summary>
                                    <ul>
                                        <li @click="removeFocus">
                                            <router-link to="/clan-battle" @click="showBrooch(0)"
                                                >Clan Battle
                                            </router-link>
                                        </li>
                                        <li @click="removeFocus">
                                            <router-link
                                                to="/territory-rankings"
                                                @click="showBrooch(0)"
                                                >Battle Rankings
                                            </router-link>
                                        </li>
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <details>
                                    <summary>
                                        Clan Management
                                        <img
                                            src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                                            class="rounded-lg w-[20px] inline cursor-pointer"
                                            alt="Emerald Brooch"
                                        />
                                    </summary>
                                    <ul>
                                        <li @click="removeFocus">
                                            <router-link
                                                to="/clan-management/wishing-well"
                                                @click="showBrooch(0)"
                                                >Wish Contributions</router-link
                                            >
                                        </li>
                                    </ul>
                                </details>
                            </li>
                            <li @click="removeFocus">
                                <router-link to="/factory">Factory </router-link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>
            <ul class="menu menu-horizontal md:hidden">
                <li>
                    <details id="sm-plaza">
                        <summary>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="w-6 h-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            </svg>
                        </summary>
                        <ul
                            tabindex="0"
                            class="z-[1] menu dropdown-content p-2 shadow-sm bg-base-100 rounded-box w-52"
                        >
                            <li @click="removeFocus">
                                <router-link to="/hero-select">Hero Select</router-link>
                            </li>
                            <li @click="removeFocus">
                                <router-link to="/combat">Combat Calculator</router-link>
                            </li>
                            <li @click="removeFocus">
                                <router-link to="/skills">Skill Training</router-link>
                            </li>
                            <li @click="removeFocus">
                                <router-link to="/lotteries">Wishing Well Ranking</router-link>
                            </li>
                            <li @click="removeFocus">
                                <router-link to="/vrf-actions" @click="showBrooch(0)"
                                    >VRF Actions
                                    <img
                                        src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                                        class="rounded-lg w-[20px] inline cursor-pointer"
                                        alt="Emerald Brooch"
                                /></router-link>
                            </li>
                            <li @click="removeFocus">
                                <router-link to="/clan-battle" @click="showBrooch(0)"
                                    >Clan Battle
                                    <img
                                        src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                                        class="rounded-lg w-[20px] inline cursor-pointer"
                                        alt="Emerald Brooch"
                                /></router-link>
                            </li>
                            <li @click="removeFocus">
                                <router-link to="/territory-rankings" @click="showBrooch(0)"
                                    >Battle Rankings
                                    <img
                                        src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                                        class="rounded-lg w-[20px] inline cursor-pointer"
                                        alt="Emerald Brooch"
                                /></router-link>
                            </li>
                            <li @click="removeFocus">
                                <router-link
                                    to="/clan-management/wishing-well"
                                    @click="showBrooch(0)"
                                    >Wish Contributions
                                    <img
                                        src="/src/assets/optimized/emerald-brooch-icon-80.webp"
                                        class="rounded-lg w-[20px] inline cursor-pointer"
                                        alt="Emerald Brooch"
                                /></router-link>
                            </li>

                            <li @click="removeFocus">
                                <router-link to="/factory">Factory </router-link>
                            </li>
                        </ul>
                    </details>
                </li>
            </ul>
        </div>
        <div class="navbar-end">
            <!-- <button class="btn btn-ghost btn-circle" v-if="isDark" @click="onThemeToggle('light')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
            </button>
            <button class="btn btn-ghost btn-circle" v-if="!isDark" @click="onThemeToggle('dark')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
                </svg>
            </button> -->
            <div v-if="lastChecked !== appStore.version" class="mr-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6 text-primary cursor-pointer"
                    :class="{ 'animate-pulse': lastChecked !== appStore.version }"
                    @click="onNotificationClick"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                </svg>remove factory eager load
            </div>
            <HeaderItemSearch v-if="route.meta.showItemSearch" />
            <appkit-button size="sm" />
        </div>
    </nav>
    <Donate ref="donateRef" />
    <RubyBroochPaywall ref="rubyUpgradeRef" />
    <Changelog ref="changelogRef" id="changelog-modal" />
</template>

<style scoped>
.chain-icon {
    max-width: 40px;
    max-height: 40px;
    min-width: 40px;
    min-height: 40px;
}

.small-chain-icon {
    max-height: 30px;
    max-width: 30px;
}

.navbar-end {
    min-width: 280px;
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        color: var(--primary);
    }
    50% {
        transform: scale(1.1);
        color: #fff;
    }
    100% {
        transform: scale(1);
        color: var(--primary);
    }
}
</style>
