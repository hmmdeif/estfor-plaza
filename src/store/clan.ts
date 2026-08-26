import { Clan, Player, Territory } from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"
import { getClans, getTerritories } from "../utils/api"
import { getLevel } from "./core"

export interface ClanState {
    clans: Clan[]
    initialised: boolean
    territories: Territory[]
    initialisedAt: Date | null
}

export const getDiceRollForRank = (rank: number, isEvolved: boolean) => {
    // get 1 dice roll every 20 ranks, start with 1 by default
    return Math.floor(rank / 20) + 1 + (isEvolved ? 1 : 0)
}

export const getDiceRolls = (player: Player, addPoint = false) => {
    let diceRolls = 0
    diceRolls +=
        getDiceRollForRank(getLevel(player.woodcuttingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.miningXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.fishingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.cookingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.smithingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.fletchingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.craftingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.healthXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.meleeXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.defenceXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.rangedXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.magicXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.alchemyXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.firemakingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.thievingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.forgingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    diceRolls +=
        getDiceRollForRank(getLevel(player.farmingXP), player.isFullMode) +
        (addPoint ? 1 : 0)
    return diceRolls
}

export const calculateBattleChances = (
    simulationCount: number,
    clanA: any[],
    clanB: any[],
    addOneMaxPoint: boolean,
    battleArena: string
) => {
    if (simulationCount > 100000) {
        simulationCount = 100000
    }

    // pad out the smaller clan with auto-losses
    if (clanA.length < clanB.length) {
        const difference = clanB.length - clanA.length
        for (let i = 0; i < difference; i++) {
            clanA.push({
                diceRolls: 0,
            })
        }
    } else if (clanB.length < clanA.length) {
        const difference = clanA.length - clanB.length
        for (let i = 0; i < difference; i++) {
            clanB.push({
                diceRolls: 0,
            })
        }
    }

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
        }
    }

    const getByteArray = () => {
        const byteArray = []
        // create an array of random 0 and 1s of length 8
        for (let i = 0; i < 8; i++) {
            byteArray.push(Math.round(Math.random()))
        }
        return byteArray
    }

    let clanATotalWins = 0
    let clanBTotalWins = 0

    for (let i = 0; i < simulationCount; i++) {
        let clanAWins = 0
        let clanBWins = 0

        // shuffle member arrays
        shuffleArray(clanA)
        shuffleArray(clanB)

        // make an array of skills the same length as clan members
        const skills = [
            "woodcuttingXP",
            "miningXP",
            "fishingXP",
            "cookingXP",
            "smithingXP",
            "fletchingXP",
            "craftingXP",
            "healthXP",
            "meleeXP",
            "defenceXP",
            "rangedXP",
            "magicXP",
            "alchemyXP",
            "firemakingXP",
            "thievingXP",
            "forgingXP",
        ]

        const skillsArray = []
        for (let j = 0; j < clanA.length; j++) {
            // pick random skill and push to skillsArray
            const skill = skills[Math.floor(Math.random() * skills.length)]
            skillsArray.push(skill)
        }

        // loop through clan members and roll dice
        for (let j = 0; j < clanA.length; j++) {
            const clanAMember = clanA[j]
            const clanBMember = clanB[j]

            if (clanAMember.diceRolls === 0) {
                // auto-loss
                clanBWins++
                continue
            }

            if (clanBMember.diceRolls === 0) {
                // auto-loss
                clanAWins++
                continue
            }

            // each dice roll is a d20. make an array of d20 dice rolls and the highest number wins
            let highestADiceRoll = 0
            let highestBDiceRoll = 0

            const clanAMemberDiceRoll =
                getDiceRollForRank(
                    getLevel(clanAMember[skillsArray[j]]),
                    clanAMember.isFullMode
                ) + (addOneMaxPoint && battleArena === "Vault" ? 1 : 0)
            const clanBMemberDiceRoll = getDiceRollForRank(
                getLevel(clanBMember[skillsArray[j]]),
                clanBMember.isFullMode
            )

            const clanAByteArray = getByteArray()
            const clanBByteArray = getByteArray()

            for (let k = 0; k < clanAMemberDiceRoll; k++) {
                // the following is based on a d20 roll
                // const diceRoll = Math.floor(Math.random() * 20) + 1
                // if (diceRoll > highestADiceRoll) {
                //     highestADiceRoll = diceRoll
                // }

                highestADiceRoll += clanAByteArray[k] === 1 ? 1 : 0
            }

            for (let k = 0; k < clanBMemberDiceRoll; k++) {
                // the following is based on a d20 roll
                // const diceRoll = Math.floor(Math.random() * 20) + 1
                // if (diceRoll > highestBDiceRoll) {
                //     highestBDiceRoll = diceRoll
                // }

                highestBDiceRoll += clanBByteArray[k] === 1 ? 1 : 0
            }

            if (highestADiceRoll > highestBDiceRoll) {
                clanAWins++
            } else if (highestBDiceRoll > highestADiceRoll) {
                clanBWins++
            }
        }

        if (clanAWins > clanBWins) {
            clanATotalWins++
        } else if (clanBWins > clanAWins) {
            clanBTotalWins++
        } else {
            // draw, attacker wins
            clanATotalWins++
        }
    }

    return {
        clanA: ((clanATotalWins / simulationCount) * 100).toFixed(1),
        clanB: ((clanBTotalWins / simulationCount) * 100).toFixed(1),
    }
}

export const useClanStore = defineStore("clan", {
    state: () =>
        ({
            clans: [] as Clan[],
            territories: [] as Territory[],
            initialised: false,
            initialisedAt: null,
        }) as ClanState,
    getters: {
        clanNames(state: ClanState) {
            return state.clans.map((clan) => clan.name)
        },
        sortedTerritories(state: ClanState) {
            state.territories.sort((a, b) => {
                if (a.percentageEmissions > b.percentageEmissions) {
                    return -1
                }
                if (a.percentageEmissions < b.percentageEmissions) {
                    return 1
                }
                if (a.territoryId > b.territoryId) {
                    return 1
                }
                if (a.territoryId < b.territoryId) {
                    return -1
                }
                return 0
            })
            return state.territories.map((t) => {
                return {
                    id: t.territoryId,
                    percentageEmissions: t.percentageEmissions,
                    owner: t.clanOccupier?.name || "Unclaimed",
                    unclaimedEmissions: t.unclaimedEmissions,
                    combatants: t.clanOccupier?.territoryCombatants || [],
                    chanceToWin: null,
                }
            })
        },
        sortedVaults(state: ClanState) {
            const clans = [...state.clans]
            clans.sort((a: Clan, b: Clan) => {
                const aTotal = a.lockedVaults.reduce((acc, curr) => {
                    if (
                        parseInt(curr.unlockTimestamp) <
                        new Date().getTime() / 1000
                    ) {
                        return acc
                    }
                    return acc + BigInt(curr.amount)
                }, BigInt(0))
                const bTotal = b.lockedVaults.reduce((acc, curr) => {
                    if (
                        parseInt(curr.unlockTimestamp) <
                        new Date().getTime() / 1000
                    ) {
                        return acc
                    }
                    return acc + BigInt(curr.amount)
                }, BigInt(0))
                if (aTotal > bTotal) {
                    return -1
                }
                if (aTotal < bTotal) {
                    return 1
                }
                return 0
            })
            return clans.slice(0, 25).map((c) => {
                return {
                    id: c.id,
                    name: c.name,
                    total: c.lockedVaults.reduce((acc, curr) => {
                        if (
                            parseInt(curr.unlockTimestamp) <
                            new Date().getTime() / 1000
                        ) {
                            return acc
                        }
                        return acc + BigInt(curr.amount)
                    }, BigInt(0)),
                    combatants: c.lockedVaultCombatants || [],
                    chanceToWin: null,
                }
            })
        },
    },
    actions: {
        async getAllClanInfo() {
            if (
                this.initialised &&
                this.initialisedAt &&
                new Date().getTime() - this.initialisedAt.getTime() <
                    1000 * 60 * 10
            ) {
                return
            }
            let numToSkip = 0
            let moreToFetch = true
            let localClans: Clan[] = []
            while (moreToFetch) {
                const clans = await getClans(numToSkip)
                if (clans.clans.length === 0 || clans.clans.length < 100) {
                    localClans.push(...clans.clans)
                    moreToFetch = false
                } else {
                    localClans.push(...clans.clans)
                    numToSkip += clans.clans.length
                }
            }
            this.clans = localClans
            this.territories = (await getTerritories()).territories
            this.initialised = true
            this.initialisedAt = new Date()
        },
    },
})
