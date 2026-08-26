import { defineStore } from "pinia"
import { readContract, getAccount } from "@wagmi/core"

import { decode } from "../utils/abi"
import estforPlayerAbi from "../abi/estforPlayer.json"
import oldEstforPlayerAbi from "../abi/oldEstforPlayer.json"
import broochAbi from "../abi/brooch.json"
import {
    getPlayerState,
    getGlobalData,
    getUserItemNFTs,
    getSoloPlayerState,
    getOwnedPets,
    getClanByName,
} from "../utils/api"
import {
    BoostType,
    Clan,
    CoreData,
    Pet,
    Player,
    QueuedAction,
    Skill,
    UserItemNFT,
} from "@paintswap/estfor-definitions/types"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { allItems } from "../data/items"
import { allFullAttireBonuses } from "../data/fullAttireBonuses"
import { HOMEMADE_BROOCH_ADDRESS } from "../utils/addresses"
import { fantom, sonic } from "viem/chains"
import { useBroochStore } from "./brooch"
import { config } from "../config"

export const NATIVE_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
export const MEDIA_URL = "https://media.estfor.com"

export enum Address {
    estforPlayers,
    factoryRegistry,
    estforPlayerNFT,
    itemNFT,
    brush,
    bridge,
    multicall,
}

export interface AddressMap {
    name: Address
    address: string
}

export interface AddressNetworkMap {
    network: number
    addresses: AddressMap[]
}

export interface CoreState {
    addresses: AddressNetworkMap[]
    playerId: string
    playerState: Player
    originalState: Player
    clanState: Clan | null
    coreData: CoreData
    applyBoost: boolean
    individualBoost: number | null
    applyWishingWellBoost: boolean
    inventory: UserItemNFT[]
    heroRoster: Player[]
    queuedActions: QueuedAction[]
    pets: Pet[]
}

export const boostTypeNames = {
    [BoostType.ANY_XP]: "All XP",
    [BoostType.COMBAT_XP]: "Combat XP",
    [BoostType.NON_COMBAT_XP]: "Non-Combat XP",
    [BoostType.GATHERING]: "Gathering Bonus",
    [BoostType.ABSENCE]: "Absence Bonus",
    [BoostType.NONE]: "None",
    [BoostType.PASSIVE_SKIP_CHANCE]: "Passive Skip Chance",
    [BoostType.PVP_BLOCK]: "PvP Block",
    [BoostType.PVP_REATTACK]: "PvP Reattack",
    [BoostType.PVP_SUPER_ATTACK]: "Sharpened Claw",
    [BoostType.COMBAT_FIXED]: "Combat Stats",
}

export const avatarBoostSkills = {
    [1]: [Skill.MAGIC],
    [2]: [Skill.THIEVING],
    [3]: [Skill.MAGIC, Skill.DEFENCE],
    [4]: [Skill.MELEE],
    [5]: [Skill.MAGIC, Skill.HEALTH],
    [6]: [Skill.MELEE, Skill.DEFENCE],
    [7]: [Skill.RANGED],
    [8]: [Skill.MELEE, Skill.MAGIC],
    [10001]: [Skill.MAGIC],
    [10002]: [Skill.THIEVING],
    [10003]: [Skill.MAGIC, Skill.DEFENCE],
    [10004]: [Skill.MELEE],
    [10005]: [Skill.MAGIC, Skill.HEALTH],
    [10006]: [Skill.MELEE, Skill.DEFENCE],
    [10007]: [Skill.RANGED],
    [10008]: [Skill.MELEE, Skill.MAGIC],
}

export const skillToXPMap = {
    [Skill.FISHING]: "fishingXP",
    [Skill.WOODCUTTING]: "woodcuttingXP",
    [Skill.MINING]: "miningXP",
    [Skill.FLETCHING]: "fletchingXP",
    [Skill.FIREMAKING]: "firemakingXP",
    [Skill.COOKING]: "cookingXP",
    [Skill.SMITHING]: "smithingXP",
    [Skill.CRAFTING]: "craftingXP",
    [Skill.ALCHEMY]: "alchemyXP",
    [Skill.FORGING]: "forgingXP",
    [Skill.THIEVING]: "thievingXP",
    [Skill.MAGIC]: "magicXP",
    [Skill.RANGED]: "rangedXP",
    [Skill.MELEE]: "meleeXP",
    [Skill.DEFENCE]: "defenceXP",
    [Skill.FARMING]: "farmingXP",
}

export const xpBoundaries = [
    0, 84, 174, 270, 374, 486, 606, 734, 872, 1021, 1179, 1350, 1532, 1728,
    1938, 2163, 2404, 2662, 2939, 3236, 3553, 3894, 4258, 4649, 5067, 5515,
    5995, 6510, 7060, 7650, 8282, 8959, 9685, 10461, 11294, 12185, 13140, 14162,
    15258, 16432, 17689, 19036, 20479, 22025, 23681, 25456, 27357, 29393, 31575,
    33913, 36418, 39102, 41977, 45058, 48359, 51896, 55686, 59747, 64098, 68761,
    73757, 79110, 84847, 90995, 97582, 104641, 112206, 120312, 128998, 138307,
    148283, 158973, 170430, 182707, 195864, 209963, 225074, 241267, 258621,
    277219, 297150, 318511, 341403, 365936, 392228, 420406, 450605, 482969,
    517654, 554828, 594667, 637364, 683124, 732166, 784726, 841057, 901428,
    966131, 1035476, 1109796, 1189448, 1274815, 1366307, 1464364, 1569456,
    1682089, 1802804, 1932181, 2070841, 2219452, 2378726, 2549430, 2732383,
    2928465, 3138618, 3363853, 3605251, 3863972, 4141260, 4438448, 4756963,
    5098336, 5464209, 5856339, 6276611, 6727045, 7209805, 7727212, 8281752,
    8876091, 9513085, 10195795, 10927503, 11711726, 12552232, 13453061,
    14418543, 15453317, 16562359, 17750997,
]

export const getLevel = (xp: string) => {
    const level = xpBoundaries.findIndex((x) => x > parseInt(xp, 10))
    return level === -1 ? 100 : level
}

export const safeDecode = (data: any, functionName: string) => {
    try {
        return decode(data, functionName, estforPlayerAbi)
    } catch (e) {
        return decode(data, functionName, oldEstforPlayerAbi)
    }
}

export const heroAvatarMultiplier = (player: Player, skill: Skill) => {
    let multiplier = 0
    // @ts-ignore
    if ((avatarBoostSkills[player.avatarId] || []).includes(skill)) {
        let heroXPMultiplier = 1
        if (player.isFullMode) {
            heroXPMultiplier = 2
        }
        // @ts-ignore
        if (avatarBoostSkills[player.avatarId]?.length === 2) {
            multiplier += 0.05 * heroXPMultiplier
        } else {
            multiplier += 0.1 * heroXPMultiplier
        }
    }
    return multiplier
}

export const fullAttireMultiplier = (
    inventory: UserItemNFT[],
    skill: Skill
) => {
    const fullAttireBonus = allFullAttireBonuses.find((x) => x.skill === skill)
    if (!fullAttireBonus) {
        return 0
    }

    const fullAttire = fullAttireBonus.itemTokenIds.every((x) =>
        inventory.some((y) => y.tokenId === x && parseInt(y.amount, 10) > 0)
    )
    if (!fullAttire) {
        return 0
    }

    return fullAttireBonus.bonusXPPercent / 100
}

export const useCoreStore = defineStore("core", {
    state: () =>
        ({
            addresses: [
                {
                    network: fantom.id,
                    addresses: [
                        {
                            name: Address.estforPlayers,
                            address:
                                "0x058eC56ABa13F7FEE3ae9c9b91B3bB03bc336143",
                        },
                        {
                            name: Address.factoryRegistry,
                            address:
                                "0xF9A66F8C569D23f1fA1A63950c3CA822Cf26355e",
                        },
                        {
                            name: Address.estforPlayerNFT,
                            address:
                                "0xB809Ed839c691D465e2EC45E1BCb5E5adED50Fb9",
                        },
                        {
                            name: Address.itemNFT,
                            address:
                                "0x4b9C90ebb1fA98d9724dB46C4689994b46706f5a",
                        },
                        {
                            name: Address.brush,
                            address:
                                "0x85dec8c4B2680793661bCA91a8F129607571863d",
                        },
                        {
                            name: Address.bridge,
                            address:
                                "0x4381Ba70358b46e220B3E9188ACFef224e9F8a8f",
                        },
                    ],
                },
                {
                    network: sonic.id,
                    addresses: [
                        {
                            name: Address.estforPlayers,
                            address:
                                "0xefa670aad6d5921236e9655f346ca13a5c56481b",
                        },
                        {
                            name: Address.factoryRegistry,
                            address:
                                "0x32593D151D3Ba6E0c9dF933e522cC51F5ed50842",
                        },
                        {
                            name: Address.estforPlayerNFT,
                            address:
                                "0x076aeec336f5abbdf64ba8ddf96fc974b0463528",
                        },
                        {
                            name: Address.itemNFT,
                            address:
                                "0x8970c63da309d5359a579c2f53bfd64f72b7b706",
                        },
                        {
                            name: Address.brush,
                            address:
                                "0xE51EE9868C1f0d6cd968A8B8C8376Dc2991BFE44",
                        },
                        {
                            name: Address.multicall,
                            address: "0xcA11bde05977b3631167028862bE2a173976CA11",
                        },
                    ],
                },
            ],
            playerId: "0",
            playerState: {} as Player,
            originalState: {} as Player,
            pets: [] as Pet[],
            clanState: null,
            coreData: {} as CoreData,
            applyBoost: true,
            individualBoost: null,
            applyWishingWellBoost: false,
            inventory: [],
            heroRoster: localStorage.getItem("heroRoster")
                ? JSON.parse(localStorage.getItem("heroRoster") as string)
                : [],
            queuedActions: [],
        }) as CoreState,
    getters: {
        getNetworkAddressMap: (
            state: CoreState,
            chainId?: number
        ): AddressMap[] | undefined => {
            const network = chainId || getAccount(config)?.chainId
            return state.addresses.find((x) => x.network == network)?.addresses
        },
        getAddress: (state: CoreState) => {
            return (name: Address, chainId?: number) => {
                const network = chainId || getAccount(config)?.chainId
                return state.addresses
                    .find((x) => x.network == network)
                    ?.addresses.find((x) => x.name == name)?.address
            }
        },
        globalBoostData: (state: CoreState) => {
            const globalBoost = {
                value: state.coreData.globalBoostVal,
                isNonCombatActive: false,
                isCombatActive: false,
                startDateTime: new Date(
                    parseInt(state.coreData.globalBoostStartTime, 10) * 1000
                ),
                endDateTime: new Date(
                    parseInt(state.coreData.globalBoostStartTime, 10) * 1000 +
                        state.coreData.globalBoostDuration * 1000
                ),
            }

            if (
                state.coreData.globalBoostType === BoostType.NON_COMBAT_XP ||
                state.coreData.globalBoostType === BoostType.ANY_XP
            ) {
                if (globalBoost.endDateTime.getTime() > Date.now()) {
                    globalBoost.isNonCombatActive = true
                }
            }
            if (
                state.coreData.globalBoostType === BoostType.COMBAT_XP ||
                state.coreData.globalBoostType === BoostType.ANY_XP
            ) {
                if (globalBoost.endDateTime.getTime() > Date.now()) {
                    globalBoost.isCombatActive = true
                }
            }
            return globalBoost
        },
        clanBoostData: (state: CoreState) => {
            if (!state.clanState) {
                return {
                    value: 0,
                    isNonCombatActive: false,
                    isCombatActive: false,
                    startDateTime: new Date(),
                    endDateTime: new Date(),
                }
            }

            const clanBoost = {
                value: state.clanState.boostVal,
                isNonCombatActive: false,
                isCombatActive: false,
                startDateTime: new Date(
                    parseInt(state.clanState.boostStartTime, 10) * 1000
                ),
                endDateTime: new Date(
                    parseInt(state.clanState.boostStartTime, 10) * 1000 +
                        state.clanState.boostDuration * 1000
                ),
            }

            if (
                state.clanState.boostType === BoostType.NON_COMBAT_XP ||
                state.clanState.boostType === BoostType.ANY_XP
            ) {
                if (clanBoost.endDateTime.getTime() > Date.now()) {
                    clanBoost.isNonCombatActive = true
                }
            }
            if (
                state.clanState.boostType === BoostType.COMBAT_XP ||
                state.clanState.boostType === BoostType.ANY_XP
            ) {
                if (clanBoost.endDateTime.getTime() > Date.now()) {
                    clanBoost.isCombatActive = true
                }
            }
            return clanBoost
        },
        getXPBoostMultiplier: (state: CoreState) => {
            return (skill: Skill, boost: BoostType) => {
                let multiplier = 1

                // Apply innate hero boosts as they always count
                multiplier += heroAvatarMultiplier(state.playerState, skill)

                // Apply set bonus from full attire if applicable
                multiplier += fullAttireMultiplier(state.inventory, skill)

                if (!state.applyBoost) {
                    return multiplier
                }

                if (
                    state.coreData.globalBoostType === boost ||
                    state.coreData.globalBoostType === BoostType.ANY_XP
                ) {
                    if (
                        new Date(
                            parseInt(state.coreData.globalBoostStartTime, 10) *
                                1000 +
                                state.coreData.globalBoostDuration * 1000
                        ) > new Date()
                    ) {
                        multiplier += state.coreData.globalBoostVal / 100
                    }
                }
                if (
                    state.clanState &&
                    (state.clanState.boostType === boost ||
                        state.clanState.boostType === BoostType.ANY_XP)
                ) {
                    if (
                        new Date(
                            parseInt(state.clanState.boostStartTime, 10) *
                                1000 +
                                state.clanState.boostDuration * 1000
                        ) > new Date()
                    ) {
                        multiplier += state.clanState.boostVal / 100
                    }
                }

                // Average the boost values over the duration if they're shorter than a day
                if (state.individualBoost) {
                    const vial = allItems.find(
                        (x) => x.tokenId === state.individualBoost
                    )
                    if (
                        vial?.boostType === boost ||
                        vial?.boostType === BoostType.ANY_XP
                    ) {
                        multiplier +=
                            (vial.boostValue / 100) *
                            (vial.boostDuration >= 60 * 60 * 24
                                ? 1
                                : vial.boostDuration / (60 * 60 * 24))
                    }
                }

                if (state.applyWishingWellBoost) {
                    const vial = allItems.find(
                        (x) => x.tokenId === EstforConstants.LUCK_OF_THE_DRAW
                    )
                    if (
                        vial?.boostType === boost ||
                        vial?.boostType === BoostType.ANY_XP
                    ) {
                        multiplier +=
                            (vial.boostValue / 100) *
                            (vial.boostDuration >= 60 * 60 * 24
                                ? 1
                                : vial.boostDuration / (60 * 60 * 24))
                    }
                }

                return multiplier
            }
        },
    },
    actions: {
        disconnect() {
            // reset state
            this.playerId = "0"
            this.playerState = {} as Player
            this.originalState = {} as Player
            this.pets = [] as Pet[]
            this.clanState = null
            this.inventory = []
            this.queuedActions = []

            const broochStore = useBroochStore()
            broochStore.disconnect()
        },
        resetPlayerState() {
            this.playerState = JSON.parse(JSON.stringify(this.originalState))
        },
        async getAllPlayerInfo(playerId: string) {
            this.playerId = playerId

            const playerState = await getPlayerState(this.playerId)
            if (playerState.clanMember) {
                this.playerState = playerState.clanMember.player

                if (playerState.clanMember.clan) {
                    const clan = await getClanByName(
                        playerState.clanMember.clan.name,
                    )
                    this.clanState = clan.clans[0]
                }
            } else {
                this.clanState = null
                const soloPlayerState = await getSoloPlayerState(
                    this.playerId,
                )
                this.playerState = soloPlayerState.player
            }

            if (this.playerState) {
                const inventory = await getUserItemNFTs(
                    this.playerState.owner,
                    allFullAttireBonuses.flatMap((x) => x.itemTokenIds),
                )
                try {
                    const pets = await getOwnedPets(
                        this.playerState.owner,
                    )
                    this.pets = pets.pets
                } catch {}

                this.inventory = inventory.userItemNFTs
                this.originalState = JSON.parse(
                    JSON.stringify(this.playerState)
                )

                this.addHeroToRoster(this.playerState)
            }
        },
        async getActivePlayer() {
            const playerAddress = this.getAddress(
                Address.estforPlayers,
                sonic.id
            )
            const account = getAccount(config)
            if (!playerAddress || !account.isConnected) {
                return
            }

            const activePlayer = await readContract(config, {
                address: playerAddress as `0x${string}`,
                abi: estforPlayerAbi,
                functionName: "getActivePlayer",
                args: [account.address],
                chainId: sonic.id,
            })

            if (!activePlayer) {
                this.disconnect()
                return
            }

            await this.getAllPlayerInfo(activePlayer as unknown as string)

            const globalState = await getGlobalData()
            this.coreData = globalState.coreData
        },
        async refreshHeroRoster() {
            const p = []
            for (const hero of this.heroRoster) {
                if (hero && hero.id) {
                    p.push(getSoloPlayerState(hero.id))
                }
            }
            const heroes = await Promise.all(p)
            this.heroRoster = heroes.map((x) => x.player)
            localStorage.setItem("heroRoster", JSON.stringify(this.heroRoster))
        },
        async loadPlayer(playerId: string) {
            const account = getAccount(config)
            const balance = await readContract(config, {
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: "balanceOf",
                args: [account.address, 0],
            })
            const balance1 = await readContract(config, {
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: "balanceOf",
                args: [account.address, 1],
            })

            if (
                (balance as unknown as bigint) < 1 &&
                (balance1 as unknown as bigint) < 1
            ) {
                throw new Error("NO_BROOCH")
            }

            await this.getAllPlayerInfo(playerId)
        },
        addHeroToRoster(player: Player) {
            if (!this.heroRoster.some((x) => x.id === player.id)) {
                this.heroRoster.push(player)
                localStorage.setItem(
                    "heroRoster",
                    JSON.stringify(this.heroRoster)
                )
            }
        },
        removeHeroFromRoster(player: Player) {
            this.heroRoster = this.heroRoster.filter((x) => x.id !== player.id)
            localStorage.setItem("heroRoster", JSON.stringify(this.heroRoster))
        },
    },
})
