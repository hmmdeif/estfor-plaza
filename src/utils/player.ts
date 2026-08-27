import { ActionChoiceInput, ActionInput, Player, RandomReward, Skill } from "@paintswap/estfor-definitions/types"
import { getLevel } from "../store/core"

export const calculateActionChoiceSuccessPercent = (
    a: ActionChoiceInput,
    playerXP: string,
    skillId: Skill
): number => {
    if (a.successPercent === 100) {
        return 1
    }
    return (
        Math.min(
            90,
            a.successPercent +
                Math.max(
                    0,
                    getLevel(playerXP) -
                        getLevel(
                            a.skillMinXPs[
                                a.skills.findIndex((s) => s === skillId)
                            ] || 0
                        )
                )
        ) / 100
    )
}

export const calculateChance = (
    r: RandomReward,
    a: ActionInput,
    playerXp: string
) => {
    return (
        (r.chance *
            Math.min(
                90,
                a.info.successPercent +
                    Math.max(0, getLevel(playerXp) - getLevel(a.info.minXP))
            )) /
        65535
    )
}

export const getHeroClass = (playerState: Player, skill: Skill = Skill.NONE) => {
    const alchemyLevel = getLevel(playerState.alchemyXP)
    const meleeLevel = getLevel(playerState.meleeXP)
    const rangedLevel = getLevel(playerState.rangedXP)
    const magicLevel = getLevel(playerState.magicXP)
    const defenceLevel = getLevel(playerState.defenceXP)
    const farmingLevel = getLevel(playerState.farmingXP)
    const fishingLevel = getLevel(playerState.fishingXP)
    const forgeLevel = getLevel(playerState.forgingXP)
    const craftingLevel = getLevel(playerState.craftingXP)
    const woodcuttingLevel = getLevel(playerState.woodcuttingXP)
    const miningLevel = getLevel(playerState.miningXP)
    const cookingLevel = getLevel(playerState.cookingXP)
    const smithingLevel = getLevel(playerState.smithingXP)
    const fletchingLevel = getLevel(playerState.fletchingXP)
    const thievingLevel = getLevel(playerState.thievingXP)
    const firemakingLevel = getLevel(playerState.firemakingXP)

    if (skill !== Skill.NONE) {
        if (skill === Skill.ALCHEMY) {
            return `Alchemist (${alchemyLevel})`
        } else if (skill === Skill.MELEE) {
            return `Warrior (${meleeLevel})`
        } else if (skill === Skill.RANGED) {
            return `Archer (${rangedLevel})`
        } else if (skill === Skill.MAGIC) {
            return `Mage (${magicLevel})`
        } else if (skill === Skill.DEFENCE) {
            return `Defender (${defenceLevel})`
        } else if (skill === Skill.FARMING) {
            return `Farmer (${farmingLevel})`
        } else if (skill === Skill.FISHING) {
            return `Fisherman (${fishingLevel})`
        } else if (skill === Skill.FORGING) {
            return `Forger (${forgeLevel})`
        } else if (skill === Skill.CRAFTING) {
            return `Crafter (${craftingLevel})`
        } else if (skill === Skill.WOODCUTTING) {
            return `Lumberjack (${woodcuttingLevel})`
        } else if (skill === Skill.MINING) {
            return `Miner (${miningLevel})`
        } else if (skill === Skill.COOKING) {
            return `Cook (${cookingLevel})`
        } else if (skill === Skill.SMITHING) {
            return `Blacksmith (${smithingLevel})`
        } else if (skill === Skill.FLETCHING) {
            return `Fletcher (${fletchingLevel})`
        } else if (skill === Skill.THIEVING) {
            return `Thief (${thievingLevel})`
        } else if (skill === Skill.FIREMAKING) {
            return `Firemaker (${firemakingLevel})`
        } else if (skill === Skill.COMBAT) {
            return `Combat (${meleeLevel}/${rangedLevel}/${magicLevel}/${defenceLevel})`
        }
    }

    const highestLevel = Math.max(alchemyLevel, meleeLevel, rangedLevel, magicLevel, defenceLevel, farmingLevel, fishingLevel, forgeLevel, craftingLevel, woodcuttingLevel, miningLevel, cookingLevel, smithingLevel, fletchingLevel, thievingLevel, firemakingLevel)
    
    // compare highest level to each class level
    if (highestLevel === alchemyLevel) {
        return `Alchemist (${alchemyLevel})`
    } else if (highestLevel === meleeLevel) {
        return `Warrior (${meleeLevel})`
    } else if (highestLevel === rangedLevel) {
        return `Archer (${rangedLevel})`
    } else if (highestLevel === magicLevel) {
        return `Mage (${magicLevel})`
    } else if (highestLevel === defenceLevel) {
        return `Defender (${defenceLevel})`
    } else if (highestLevel === farmingLevel) {
        return `Farmer (${farmingLevel})`
    } else if (highestLevel === fishingLevel) {
        return `Fisherman (${fishingLevel})`
    } else if (highestLevel === forgeLevel) {
        return `Forger (${forgeLevel})`
    } else if (highestLevel === craftingLevel) {
        return `Crafter (${craftingLevel})`
    } else if (highestLevel === woodcuttingLevel) {
        return `Lumberjack (${woodcuttingLevel})`
    } else if (highestLevel === miningLevel) {
        return `Miner (${miningLevel})`
    } else if (highestLevel === cookingLevel) {
        return `Cook (${cookingLevel})`
    } else if (highestLevel === smithingLevel) {
        return `Blacksmith (${smithingLevel})`
    } else if (highestLevel === fletchingLevel) {
        return `Fletcher (${fletchingLevel})`
    } else if (highestLevel === thievingLevel) {
        return `Thief (${thievingLevel})`
    } else if (highestLevel === firemakingLevel) {
        return `Firemaker (${firemakingLevel})`
    }
    return "Unknown"
}