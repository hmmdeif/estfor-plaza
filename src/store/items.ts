import {
    ActionChoiceInput,
    BasePet,
    CombatStats,
    EquipPosition,
    ItemInput,
    Pet,
    PetEnhancementType,
    PetSkin,
    Skill,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allItems } from "../data/items"
import {
    allActionChoicesRanged,
    allActionChoicesMagic,
} from "../data/actionChoices"
import { getLevel, useCoreStore } from "./core"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { EquippedItems, ProxySilo } from "./models/factory.models"
import {
    allActionChoiceIdsMagic,
    allActionChoiceIdsRanged,
} from "../data/actionChoiceIds"
import { allBasePets } from "../data/pets"

const magicSpellNames = [
    "SHADOW BLAST",
    "NATURES FURY",
    "DEATH WAVE",
    "VORTEX",
    "MYSTIC BLAST",
    "MAGIC BREATH",
    "SUMMON HELL HOUND",
    "AIR BALL",
    "FURY FISTS",
    "CONCUSSION BEAMS",
    "ICE SPIKES",
    "SUMMON EMBER FIEND",
    "SHATTERFROST BOMB",
    "METEOR STORM",
    "GLACIAL COMET",
    "SHADOW BOLT",
    "RAZOR LEAVES",
    "HEX",
    "TORRENT SURGE",
    "HYDRO BURST",
    "VOID WAVE",
    "RAISE DEAD",
    "TORNADO",
    "SUMMON WIND FAMILIAR",
    "ARCANE NOVA",
    "FROST BREATH",
    "LIFE DRAIN",
    "BLIZZARD",
    "STARFALL",
    "CHRONO FREEZE",
]

export const starterItems = [
    allItems.find((x) => x.tokenId === EstforConstants.BRONZE_SWORD)?.tokenId,
    allItems.find((x) => x.tokenId === EstforConstants.MAGIC_FIRE_STARTER)
        ?.tokenId,
    allItems.find((x) => x.tokenId === EstforConstants.BRONZE_AXE)?.tokenId,
    allItems.find((x) => x.tokenId === EstforConstants.NET_STICK)?.tokenId,
    allItems.find((x) => x.tokenId === EstforConstants.BRONZE_PICKAXE)?.tokenId,
    allItems.find((x) => x.tokenId === EstforConstants.BASIC_BOW)?.tokenId,
    allItems.find((x) => x.tokenId === EstforConstants.TOTEM_STAFF)?.tokenId,
]

export const rangedItemToActionChoice = (rightHand: number, arrow: number) => {
    switch (rightHand) {
        case EstforConstants.BASIC_BOW:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_BASIC_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_BASIC_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_BASIC_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_BASIC_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_BASIC_BOW
            }
        case EstforConstants.BONE_BOW:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_BONE_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_BONE_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_BONE_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_BONE_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_BONE_BOW
            }
        case EstforConstants.EXPERT_BOW:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_EXPERT_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_EXPERT_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_EXPERT_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_EXPERT_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_EXPERT_BOW
            }
        case EstforConstants.SPECTRAL_BOW:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_SPECTRAL_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_SPECTRAL_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_SPECTRAL_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_SPECTRAL_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_SPECTRAL_BOW
            }
        case EstforConstants.ICY_BOW:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_ICY_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_ICY_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_ICY_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_ICY_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_ICY_BOW
            }
        case EstforConstants.GLITTERING_BOW:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_GLITTERING_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_GLITTERING_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_GLITTER_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_GLITTER_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_GLITTERING_BOW
            }
        case EstforConstants.GODLY_BOW:
        case EstforConstants.GODLY_BOW_1:
        case EstforConstants.GODLY_BOW_2:
        case EstforConstants.GODLY_BOW_3:
        case EstforConstants.GODLY_BOW_4:
        case EstforConstants.GODLY_BOW_5:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW
            }
        case EstforConstants.CROSSBOW_001_BRONZE:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_EFFYD_KIEL_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_EFFYD_KIEL_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_EFFYD_KIEL_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_EFFYD_KIEL_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_EFFYD_KIEL
            }
        case EstforConstants.CROSSBOW_002_IRON:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_HAEARN_KIEL_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_HAEARN_KIEL_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_HAEARN_KIEL_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_HAEARN_KIEL_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_HAEARN_KIEL
            }
        case EstforConstants.CROSSBOW_003_MITHRIL:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_ITHRITH_KIEL_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_ITHRITH_KIEL_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_ITHRITH_KIEL_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_ITHRITH_KIEL_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_ITHRITH_KIEL
            }
        case EstforConstants.CROSSBOW_004_ADAMANTINE:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_ADAMA_KIEL_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_ADAMA_KIEL_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_ADAMA_KIEL_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_ADAMA_KIEL_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_ADAMA_KIEL
            }
        case EstforConstants.CROSSBOW_005_RUNITE:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_RHUN_KIEL_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_RHUN_KIEL_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_RHUN_KIEL_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_RHUN_KIEL_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_RHUN_KIEL
            }
        case EstforConstants.CROSSBOW_006_TITANIUM:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_VINGET_KIEL_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_VINGET_KIEL_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_VINGET_KIEL_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_VINGET_KIEL_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_VINGET_KIEL
            }
        case EstforConstants.CROSSBOW_007_ORICHALCUM:
        case EstforConstants.CROSSBOW_007_ORICHALCUM_1:
        case EstforConstants.CROSSBOW_007_ORICHALCUM_2:
        case EstforConstants.CROSSBOW_007_ORICHALCUM_3:
        case EstforConstants.CROSSBOW_007_ORICHALCUM_4:
        case EstforConstants.CROSSBOW_007_ORICHALCUM_5:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_DEUION_KIEL_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_DEUION_KIEL_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_DEUION_KIEL_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_DEUION_KIEL_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_DEUION_KIEL
            }
        default:
            if (arrow === EstforConstants.POISON) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_POISON
            } else if (arrow === EstforConstants.BRIMSTONE) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_FIRE
            } else if (arrow === EstforConstants.FOOLS_BERRY_EXTRACT) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_FOOLS_BERRY_EXTRACT
            } else if (arrow === EstforConstants.LUMELILA_TOXIN) {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW_LUMELILA_TOXIN
            } else {
                return EstforConstants.ACTIONCHOICE_RANGED_GODLY_BOW
            }
    }
}

export const petEnhancementTypeToName = {
    [PetEnhancementType.DEFENCE]: "Defence",
    [PetEnhancementType.MELEE]: "Melee",
    [PetEnhancementType.RANGED]: "Ranged",
    [PetEnhancementType.MAGIC]: "Magic",
    [PetEnhancementType.HEALTH]: "Health",
    [PetEnhancementType.MAGIC_AND_DEFENCE]: "Magic and Defence",
    [PetEnhancementType.MELEE_AND_DEFENCE]: "Melee and Defence",
    [PetEnhancementType.RANGED_AND_DEFENCE]: "Ranged and Defence",
}

const getExtraName = (tokenId: number): string => {
    switch (Number(tokenId)) {
        case EstforConstants.FROST_MIN_TIER1:
        case EstforConstants.FROST_MIN_TIER2:
        case EstforConstants.FROST_MIN_TIER3:
        case EstforConstants.FROST_MIN_TIER4:
        case EstforConstants.FROST_MIN_TIER5:
            return "Frost Pet"
        case EstforConstants.ONEKIN_MIN_TIER1:
        case EstforConstants.ONEKIN_MIN_TIER2:
        case EstforConstants.ONEKIN_MIN_TIER3:
        case EstforConstants.ONEKIN_MIN_TIER4:
        case EstforConstants.ONEKIN_MIN_TIER5:
            return "1kin Pet"
        case EstforConstants.OG_MIN_TIER1:
        case EstforConstants.OG_MIN_TIER2:
        case EstforConstants.OG_MIN_TIER3:
        case EstforConstants.OG_MIN_TIER4:
        case EstforConstants.OG_MIN_TIER5:
            return "OG Pet"
        case EstforConstants.DEFAULT_MIN_TIER1:
        case EstforConstants.DEFAULT_MIN_TIER2:
        case EstforConstants.DEFAULT_MIN_TIER3:
        case EstforConstants.DEFAULT_MIN_TIER4:
        case EstforConstants.DEFAULT_MIN_TIER5:
            return "Genesis Pet"
        case EstforConstants.CRYSTAL_MIN_TIER1:
        case EstforConstants.CRYSTAL_MIN_TIER2:
        case EstforConstants.CRYSTAL_MIN_TIER3:
        case EstforConstants.CRYSTAL_MIN_TIER4:
        case EstforConstants.CRYSTAL_MIN_TIER5:
            return "Crystal Pet"
        case EstforConstants.ANNIV1_MIN_TIER1:
        case EstforConstants.ANNIV1_MIN_TIER2:
        case EstforConstants.ANNIV1_MIN_TIER3:
        case EstforConstants.ANNIV1_MIN_TIER4:
        case EstforConstants.ANNIV1_MIN_TIER5:
            return "Anniversary 1 Pet"
        case EstforConstants.KRAGSTYR_MIN_TIER1:
        case EstforConstants.KRAGSTYR_MIN_TIER2:
        case EstforConstants.KRAGSTYR_MIN_TIER3:
        case EstforConstants.KRAGSTYR_MIN_TIER4:
        case EstforConstants.KRAGSTYR_MIN_TIER5:
            return "Kragstyr Pet"
        default:
            return tokenId?.toString()
    }
}

export const getItemName = (tokenId: number): string => {
    return allItems.find((x) => x.tokenId === tokenId)?.name || getExtraName(tokenId) || ""
}

export const getMagicBag = (state: ItemState, magicXp: number, rightHand: number) => {
    return state.magicActionChoices
        .map((x, i) => ({
            ...x,
            tokenId:
                x.skillDiffs[x.skills.findIndex((d) => d === Skill.MAGIC)] || 0,
            name: magicSpellNames[i]
                .split(" ")
                .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
                .join(" "),
            equipPosition: EquipPosition.MAGIC_BAG,
            combatStats: {
                magicAttack:
                    x.skillDiffs[
                        x.skills.findIndex((d) => d === Skill.MAGIC)
                    ] || 0,
            },
        }))
        .filter((x) => x.skillMinXPs.every((y) => y <= magicXp))
        .filter((x) => x.isAvailable)
        .filter((x) =>
            rightHand === 0
                ? true
                : x.handItemTokenIdRangeMin <= rightHand &&
                  x.handItemTokenIdRangeMax >= rightHand
        )
}

export const getQuiverOptions = (
    state: ItemState,
    rangedXp: number,
    fletchingXp: number
) => {
    return state.rangedActionChoices
        .filter((x) =>
            x.skillMinXPs.every((y, i) =>
                i === 0 ? y <= rangedXp : y <= fletchingXp
            )
        )
        .filter((x) => x.isAvailable)
        .map((x) => ({
            ...x,
            tokenId:
                x.inputTokenIds.indexOf(EstforConstants.BRIMSTONE) !== -1
                    ? EstforConstants.BRIMSTONE
                    : x.inputTokenIds.indexOf(EstforConstants.POISON) !== -1
                      ? EstforConstants.POISON
                      : x.inputTokenIds.indexOf(
                              EstforConstants.FOOLS_BERRY_EXTRACT
                          ) !== -1
                        ? EstforConstants.FOOLS_BERRY_EXTRACT
                        : x.inputTokenIds.indexOf(
                                EstforConstants.LUMELILA_TOXIN
                            ) !== -1
                          ? EstforConstants.LUMELILA_TOXIN
                          : x.inputTokenIds[0],
            name:
                (x.inputTokenIds.indexOf(EstforConstants.BRIMSTONE) !== -1
                    ? "Fire "
                    : x.inputTokenIds.indexOf(EstforConstants.POISON) !== -1
                      ? "Poison "
                      : x.inputTokenIds.indexOf(
                              EstforConstants.FOOLS_BERRY_EXTRACT
                          ) !== -1
                        ? "Fools Berry Extract "
                        : x.inputTokenIds.indexOf(
                                EstforConstants.LUMELILA_TOXIN
                            ) !== -1
                          ? "Lumelila Toxin "
                          : "") + getItemName(x.inputTokenIds[0]),
        }))
}

const getQuiverOptionsForRightHand = (
    state: ItemState,
    rangedXp: number,
    fletchingXp: number,
    rightHand: number
) => {
    return state.rangedActionChoices
        .filter((x) =>
            x.skillMinXPs.every((y, i) =>
                i === 0 ? y <= rangedXp : y <= fletchingXp
            )
        )
        .filter((x) => x.isAvailable)
        .filter(
            (x) =>
                x.handItemTokenIdRangeMin <= rightHand &&
                x.handItemTokenIdRangeMax >= rightHand
        )
        .map((x) => ({
            ...x,
            tokenId:
                x.inputTokenIds.indexOf(EstforConstants.BRIMSTONE) !== -1
                    ? EstforConstants.BRIMSTONE
                    : x.inputTokenIds.indexOf(EstforConstants.POISON) !== -1
                      ? EstforConstants.POISON
                      : x.inputTokenIds.indexOf(
                              EstforConstants.FOOLS_BERRY_EXTRACT
                          ) !== -1
                        ? EstforConstants.FOOLS_BERRY_EXTRACT
                        : x.inputTokenIds.indexOf(
                                EstforConstants.LUMELILA_TOXIN
                            ) !== -1
                          ? EstforConstants.LUMELILA_TOXIN
                          : x.inputTokenIds[0],
            name:
                (x.inputTokenIds.indexOf(EstforConstants.BRIMSTONE) !== -1
                    ? "Fire "
                    : x.inputTokenIds.indexOf(EstforConstants.POISON) !== -1
                      ? "Poison "
                      : x.inputTokenIds.indexOf(
                              EstforConstants.FOOLS_BERRY_EXTRACT
                          ) !== -1
                        ? "Fools Berry Extract "
                        : x.inputTokenIds.indexOf(
                                EstforConstants.LUMELILA_TOXIN
                            ) !== -1
                          ? "Lumelila Toxin "
                          : "") + getItemName(x.inputTokenIds[0]),
            equipPosition: EquipPosition.QUIVER,
            combatStats: {
                rangedAttack:
                    x.skillDiffs[
                        x.skills.findIndex((d) => d === Skill.RANGED)
                    ] || 0,
            },
        }))
}

const hasCombatStats = (item: ItemInput) => {
    return (
        item.combatStats.meleeAttack > 0 ||
        item.combatStats.magicAttack > 0 ||
        item.combatStats.rangedAttack > 0 ||
        item.combatStats.meleeDefence > 0 ||
        item.combatStats.magicDefence > 0 ||
        item.combatStats.rangedDefence > 0 ||
        item.combatStats.health > 0
    )
}

export interface ItemState {
    items: ItemInput[]
    rangedActionChoices: ActionChoiceInput[]
    magicActionChoices: ActionChoiceInput[]
    equippedItems: EquippedItems[]
    itemSearch: string
}

export const useItemStore = defineStore("items", {
    state: () =>
        ({
            items: allItems as ItemInput[],
            rangedActionChoices: allActionChoicesRanged as ActionChoiceInput[],
            magicActionChoices: allActionChoicesMagic as ActionChoiceInput[],
            equippedItems: localStorage.getItem("equippedItemsMulti")
                ? JSON.parse(
                      localStorage.getItem("equippedItemsMulti") as string
                  )
                : ([] as EquippedItems[]),
            itemSearch: "",
        }) as ItemState,
    getters: {
        getCurrentEquippedItems(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            return state.equippedItems.find(
                (x) => x.playerId === Number(playerState.id)
            )
        },
        getOwnedAndBasicPets: () => {
            return (ownedOnly: boolean) => {
                const coreStore = useCoreStore()
                const playerState = coreStore.playerState
                const pets = [...coreStore.pets]

                if (!ownedOnly) {
                    for (const p of allBasePets.filter(
                        (x) => x.skin === PetSkin.DEFAULT
                    )) {
                        let i = 0
                        let hasLevel = true
                        for (const m of p.skillMinLevels) {
                            switch (p.skillEnhancements[i]) {
                                case Skill.DEFENCE:
                                    if (m > getLevel(playerState.defenceXP)) {
                                        hasLevel = false
                                    }
                                    break
                                case Skill.MAGIC:
                                    if (m > getLevel(playerState.magicXP)) {
                                        hasLevel = false
                                    }
                                    break
                                case Skill.MELEE:
                                    if (m > getLevel(playerState.meleeXP)) {
                                        hasLevel = false
                                    }
                                    break
                                case Skill.RANGED:
                                    if (m > getLevel(playerState.rangedXP)) {
                                        hasLevel = false
                                    }
                                    break
                            }
                            i++
                        }
                        if (!hasLevel) continue

                        pets.push({
                            // @ts-ignore
                            name: `Min T${p.tier} ${petEnhancementTypeToName[p.enhancementType]}`,
                            owner: coreStore.playerState.owner,
                            skillFixedEnhancements: p.skillFixedMins,
                            skillPercentageEnhancements: p.skillPercentageMins,
                            basePet: {
                                tier: p.tier,
                                enhancementType: p.enhancementType,
                                skillEnhancements: p.skillEnhancements,
                            } as BasePet,
                        } as Pet)
                        pets.push({
                            // @ts-ignore
                            name: `Max T${p.tier} ${petEnhancementTypeToName[p.enhancementType]}`,
                            owner: coreStore.playerState.owner,
                            skillFixedEnhancements: p.skillFixedMaxs,
                            skillPercentageEnhancements: p.skillPercentageMaxs,
                            basePet: {
                                tier: p.tier,
                                enhancementType: p.enhancementType,
                                skillEnhancements: p.skillEnhancements,
                            } as BasePet,
                        } as Pet)
                    }
                }
                return pets
            }
        },
        getItemsForSlotAndXP: (state: ItemState) => {
            return (position: EquipPosition) => {
                const coreStore = useCoreStore()
                const playerState = coreStore.playerState

                return state.items
                    .filter(
                        (x) =>
                            x.equipPosition === position &&
                            ((x.skill == Skill.DEFENCE &&
                                x.minXP <= playerState.defenceXP) ||
                                (x.skill == Skill.MELEE &&
                                    x.minXP <= playerState.meleeXP) ||
                                (x.skill == Skill.RANGED &&
                                    x.minXP <= playerState.rangedXP) ||
                                (x.skill == Skill.MAGIC &&
                                    x.minXP <= playerState.magicXP) ||
                                (x.skill == Skill.NONE &&
                                    (hasCombatStats(x) ||
                                        position === EquipPosition.FOOD) &&
                                    (playerState.isFullMode
                                        ? true
                                        : !x.isFullModeOnly)))
                    )
                    .filter((x) => x.isAvailable)
            }
        },
        getMagicActionChoicesForXP(state: ItemState) {
            return (rightHand: number) => {
                const coreStore = useCoreStore()
                const playerState = coreStore.playerState

                return getMagicBag(
                    state,
                    Number(playerState.magicXP),
                    rightHand
                )
            }
        },
        getRangedActionChoicesForXP(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            return getQuiverOptionsForRightHand(
                state,
                Number(playerState.rangedXP),
                Number(playerState.fletchingXP),
                state.equippedItems.find(
                    (x) => x.playerId === Number(playerState.id)
                )?.rightHand || 0
            )
        },
        getAggregatedCombatStats(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            const stats = new CombatStats()
            const localEquippedItems =
                (state.equippedItems.find(
                    (x) => x.playerId === Number(playerState.id)
                ) as any) || {}
            Object.keys(localEquippedItems).forEach((key) => {
                if (
                    key !== "magicBag" &&
                    key !== "playerId" &&
                    key !== "pet" &&
                    key !== "quiver"
                ) {
                    // skip magic bag as they require special calculations
                    const item = state.items.find(
                        (x) => x.tokenId === localEquippedItems[key]
                    )
                    if (item) {
                        stats.meleeAttack += item.combatStats.meleeAttack
                        stats.magicAttack += item.combatStats.magicAttack
                        stats.rangedAttack += item.combatStats.rangedAttack
                        stats.meleeDefence += item.combatStats.meleeDefence
                        stats.magicDefence += item.combatStats.magicDefence
                        stats.rangedDefence += item.combatStats.rangedDefence
                        stats.health += item.combatStats.health
                    }
                }
            })

            if (localEquippedItems.magicBag) {
                stats.magicAttack += localEquippedItems.magicBag
            }
            if (localEquippedItems.quiver) {
                stats.rangedAttack +=
                    allActionChoicesRanged[
                        allActionChoiceIdsRanged.findIndex(
                            (x) =>
                                x ===
                                rangedItemToActionChoice(
                                    Number(localEquippedItems.rightHand),
                                    Number(localEquippedItems.quiver)
                                )
                        )
                    ]?.skillDiffs[0] || 0
            }

            if (localEquippedItems.pet) {
                switch (localEquippedItems.pet.basePet.enhancementType) {
                    case PetEnhancementType.DEFENCE:
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MELEE:
                        stats.meleeAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.meleeXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.RANGED:
                        stats.rangedAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.rangedXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MAGIC:
                        stats.magicAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.magicXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.HEALTH:
                        stats.health +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.healthXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MAGIC_AND_DEFENCE:
                        stats.magicAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.magicXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MELEE_AND_DEFENCE:
                        stats.meleeAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.meleeXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        break
                    case PetEnhancementType.RANGED_AND_DEFENCE:
                        stats.rangedAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.rangedXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        break
                }
            }

            if (coreStore.individualBoost && coreStore.applyBoost) {
                const vial = state.items.find(
                    (x) => x.tokenId === coreStore.individualBoost
                )
                if (vial) {
                    stats.meleeAttack += vial.combatStats.meleeAttack
                    stats.magicAttack += vial.combatStats.magicAttack
                    stats.rangedAttack += vial.combatStats.rangedAttack
                    stats.meleeDefence += vial.combatStats.meleeDefence
                    stats.magicDefence += vial.combatStats.magicDefence
                    stats.rangedDefence += vial.combatStats.rangedDefence
                    stats.health += vial.combatStats.health
                }
            }

            return stats
        },
        getTotalCombatStats(state: ItemState) {
            const coreStore = useCoreStore()
            const playerState = coreStore.playerState

            const stats = new CombatStats()
            const localEquippedItems =
                (state.equippedItems.find(
                    (x) => x.playerId === Number(playerState.id)
                ) as any) || {}
            Object.keys(localEquippedItems).forEach((key) => {
                if (
                    key !== "magicBag" &&
                    key !== "playerId" &&
                    key !== "pet" &&
                    key !== "quiver"
                ) {
                    // skip magic bag as they require special calculations
                    const item = state.items.find(
                        (x) => x.tokenId === localEquippedItems[key]
                    )
                    if (item) {
                        stats.meleeAttack += item.combatStats.meleeAttack
                        stats.magicAttack += item.combatStats.magicAttack
                        stats.rangedAttack += item.combatStats.rangedAttack
                        stats.meleeDefence += item.combatStats.meleeDefence
                        stats.magicDefence += item.combatStats.magicDefence
                        stats.rangedDefence += item.combatStats.rangedDefence
                        stats.health += item.combatStats.health
                    }
                }
            })

            if (localEquippedItems.magicBag) {
                stats.magicAttack += localEquippedItems.magicBag
            }
            if (localEquippedItems.quiver) {
                stats.rangedAttack +=
                    allActionChoicesRanged[
                        allActionChoiceIdsRanged.findIndex(
                            (x) =>
                                x ===
                                rangedItemToActionChoice(
                                    Number(localEquippedItems.rightHand),
                                    Number(localEquippedItems.quiver)
                                )
                        )
                    ]?.skillDiffs[0] || 0
            }

            if (localEquippedItems.pet) {
                switch (localEquippedItems.pet.basePet.enhancementType) {
                    case PetEnhancementType.DEFENCE:
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MELEE:
                        stats.meleeAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.meleeXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.RANGED:
                        stats.rangedAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.rangedXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MAGIC:
                        stats.magicAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.magicXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.HEALTH:
                        stats.health +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.healthXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MAGIC_AND_DEFENCE:
                        stats.magicAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.magicXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        break
                    case PetEnhancementType.MELEE_AND_DEFENCE:
                        stats.meleeAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.meleeXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        break
                    case PetEnhancementType.RANGED_AND_DEFENCE:
                        stats.rangedAttack +=
                            localEquippedItems.pet.skillFixedEnhancements[0] +
                            Math.floor(
                                getLevel(playerState.rangedXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[0] /
                                        100)
                            )
                        stats.meleeDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.magicDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        stats.rangedDefence +=
                            localEquippedItems.pet.skillFixedEnhancements[1] +
                            Math.floor(
                                getLevel(playerState.defenceXP) *
                                    (localEquippedItems.pet
                                        .skillPercentageEnhancements[1] /
                                        100)
                            )
                        break
                }
            }

            stats.meleeAttack += getLevel(playerState.meleeXP)
            stats.magicAttack += getLevel(playerState.magicXP)
            stats.rangedAttack += getLevel(playerState.rangedXP)
            stats.meleeDefence += getLevel(playerState.defenceXP)
            stats.magicDefence += getLevel(playerState.defenceXP)
            stats.rangedDefence += getLevel(playerState.defenceXP)
            stats.health += getLevel(playerState.healthXP)

            if (coreStore.individualBoost && coreStore.applyBoost) {
                const vial = state.items.find(
                    (x) => x.tokenId === coreStore.individualBoost
                )
                if (vial) {
                    stats.meleeAttack += vial.combatStats.meleeAttack
                    stats.magicAttack += vial.combatStats.magicAttack
                    stats.rangedAttack += vial.combatStats.rangedAttack
                    stats.meleeDefence += vial.combatStats.meleeDefence
                    stats.magicDefence += vial.combatStats.magicDefence
                    stats.rangedDefence += vial.combatStats.rangedDefence
                    stats.health += vial.combatStats.health
                }
            }

            return stats
        },
        getTotalCombatStatsForHero(state: ItemState) {
            return (hero: ProxySilo, equippedItems: EquippedItems) => {
                const stats = new CombatStats()

                Object.keys(equippedItems).forEach((key) => {
                    if (
                        key !== "magicBag" &&
                        key !== "playerId" &&
                        key !== "pet" &&
                        key !== "quiver"
                    ) {
                        // skip magic bag as they require special calculations
                        const item = state.items.find(
                            // @ts-ignore
                            (x) => x.tokenId === Number(equippedItems[key])
                        )
                        if (item) {
                            stats.meleeAttack += item.combatStats.meleeAttack
                            stats.magicAttack += item.combatStats.magicAttack
                            stats.rangedAttack += item.combatStats.rangedAttack
                            stats.meleeDefence += item.combatStats.meleeDefence
                            stats.magicDefence += item.combatStats.magicDefence
                            stats.rangedDefence +=
                                item.combatStats.rangedDefence
                            stats.health += item.combatStats.health
                        }
                    }
                })

                if (equippedItems.magicBag) {
                    stats.magicAttack +=
                        allActionChoicesMagic[
                            allActionChoiceIdsMagic.findIndex(
                                (x) => x === Number(equippedItems.magicBag)
                            )
                        ]?.skillDiffs.find((d) => d.skill === Skill.MAGIC) || 0
                }
                if (equippedItems.quiver) {
                    stats.rangedAttack +=
                        allActionChoicesRanged[
                            allActionChoiceIdsRanged.findIndex(
                                (x) =>
                                    x ===
                                    rangedItemToActionChoice(
                                        Number(equippedItems.rightHand),
                                        Number(equippedItems.quiver)
                                    )
                            )
                        ]?.skillDiffs.find((d) => d.skill === Skill.RANGED) || 0
                }

                stats.meleeAttack += getLevel(hero.playerState.meleeXP)
                stats.magicAttack += getLevel(hero.playerState.magicXP)
                stats.rangedAttack += getLevel(hero.playerState.rangedXP)
                stats.meleeDefence += getLevel(hero.playerState.defenceXP)
                stats.magicDefence += getLevel(hero.playerState.defenceXP)
                stats.rangedDefence += getLevel(hero.playerState.defenceXP)
                stats.health += getLevel(hero.playerState.healthXP)

                return stats
            }
        },
    },
    actions: {
        updateEquippedItems(equippedItems: EquippedItems) {
            const coreStore = useCoreStore()
            const e = this.equippedItems.find(
                (x) => x.playerId === Number(coreStore.playerId)
            )
            if (e) {
                e.head = equippedItems.head
                e.neck = equippedItems.neck
                e.body = equippedItems.body
                e.arms = equippedItems.arms
                e.legs = equippedItems.legs
                e.feet = equippedItems.feet
                e.rightHand = equippedItems.rightHand
                e.leftHand = equippedItems.leftHand
                e.magicBag = equippedItems.magicBag
                e.ring = equippedItems.ring
                e.quiver = equippedItems.quiver
                e.food = equippedItems.food
                e.pet = equippedItems.pet
            } else {
                equippedItems.playerId = Number(coreStore.playerId)
                this.equippedItems.push(equippedItems)
            }
            localStorage.setItem(
                "equippedItemsMulti",
                JSON.stringify(this.equippedItems)
            )
        },
    },
})
