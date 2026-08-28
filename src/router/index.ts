import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import { useBroochStore } from "../store/brooch"
// All components are lazy loaded so their stores and data dependencies stay
// out of the startup bundle.
const Base = () => import("../components/Base.vue")
const CombatCalculator = () => import("../components/CombatCalculator.vue")
const SkillTraining = () => import("../components/SkillTraining.vue")
const HeroSelect = () => import("../components/HeroSelect.vue")
const LotteryRanking = () => import("../components/LotteryRanking.vue")
const ClanBattle = () => import("../components/ClanBattle.vue")
const TerritoryBattleRankings = () =>
    import("../components/TerritoryBattleRankings.vue")
const VaultBattleRankings = () => import("../components/VaultBattleRankings.vue")
const ClanManagement = () => import("../components/ClanManagement.vue")
const WishContributions = () =>
    import("../components/clan-management/WishContributions.vue")
const About = () => import("../components/About.vue")
const VRFActions = () => import("../components/VRFActions.vue")

import { useAppStore } from "../store/app"

declare module "vue-router" {
    interface RouteMeta {
        showItemSearch?: boolean
        requiresEmeraldBrooch?: boolean
        requiresRubyBrooch?: boolean
        public?: boolean
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        component: Base,
        children: [
            {
                path: "",
                redirect: "/combat",
            },
            {
                path: "combat",
                component: CombatCalculator,
                meta: {
                    showItemSearch: true,
                },
            },
            {
                path: "skills",
                component: SkillTraining,
                meta: {
                    showItemSearch: true,
                },
            },
            {
                path: "hero-select",
                component: HeroSelect,
            },
            {
                path: "lotteries",
                component: LotteryRanking,
            },
            {
                path: "vrf-actions",
                component: VRFActions,
                meta: {
                    showItemSearch: true,
                    requiresEmeraldBrooch: true,
                },
            },
            {
                path: "clan-battle",
                component: ClanBattle,
                meta: {
                    requiresEmeraldBrooch: true,
                },
            },
            {
                path: "territory-rankings",
                component: TerritoryBattleRankings,
                meta: {
                    requiresEmeraldBrooch: true,
                },
            },
            {
                path: "vault-rankings",
                component: VaultBattleRankings,
                meta: {
                    requiresEmeraldBrooch: true,
                },
            },
            {
                path: "clan-management",
                component: ClanManagement,
                redirect: "/clan-management/wishing-well",
                children: [
                    {
                        path: "wishing-well",
                        component: WishContributions,
                        meta: {
                            requiresEmeraldBrooch: true,
                        },
                        props: true,
                    },
                ],
            },
            {
                path: "factory",
                component: () => import("../components/FactorySonic.vue"),
            },
            {
                path: "about",
                component: About,
                meta: {
                    public: true,
                },
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(async (to) => {
    const appStore = useAppStore()
    appStore.loadingRoute = true

    if (to.meta.requiresEmeraldBrooch) {
        const broochStore = useBroochStore()
        if (broochStore.brooch(0).baseTokenPrice === 0) {
            await broochStore.getBroochData(0, false)
        }
        if (broochStore.brooch(1).baseTokenPrice === 0) {
            await broochStore.getBroochData(1, true)
        }
        if (
            broochStore.brooch(0).balance === 0 &&
            broochStore.brooch(1).balance === 0
        ) {
            return "/"
        }
    }
    if (to.meta.requiresRubyBrooch) {
        const broochStore = useBroochStore()
        if (broochStore.brooch(1).baseTokenPrice === 0) {
            await broochStore.getBroochData(1, true)
        }
        if (broochStore.brooch(1).balance === 0) {
            return "/"
        }
    }
})

router.afterEach(() => {
    const appStore = useAppStore()
    appStore.loadingRoute = false
})

router.onError((error) => {
    console.error(error)
})

export default router
