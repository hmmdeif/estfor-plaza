import {
    ActionInput,
    CombatStats,
    GuaranteedReward,
    QueuedAction,
    RandomReward,
    Skill,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allActions } from "../data/actions"
import { ItemState, useItemStore } from "./items"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { useCoreStore, safeDecode } from "./core"
import { EquippedItems, ProxySilo } from "./models/factory.models"
import { monsterThumbSource } from "../utils/media"
import {
    allActionChoicesMagic,
    allActionChoicesMelee,
    allActionChoicesRanged,
} from "../data/actionChoices"
import {
    allActionChoiceIdsMagic,
    allActionChoiceIdsMelee,
    allActionChoiceIdsRanged,
} from "../data/actionChoiceIds"

export interface MonsterState {
    monsters: ActionInput[]
}

export interface MonsterRank {
    name: string
    damagePerMinute: number
    damageTakenPerHour: number
    xpPerHour: number
    imgSource: string
    meleeDamagePerMinute: number
    rangedDamagePerMinute: number
    magicDamagePerMinute: number
    fishRequiredPerHour: number
    combatStats: CombatStats
    guaranteedRewards: GuaranteedReward[]
    randomRewards: RandomReward[]
}

export const calculateDamage = (atk: number, def: number) => {
    if (atk === 0) return 0
    def = Math.max(atk * -1, def)
    let damage = atk * 3 - def
    return Math.max(1, damage)
}

export const calculateMonsterDamage = (
    attackSkill: number,
    isMelee: boolean,
    isRanged: boolean,
    isMagic: boolean,
    m: ActionInput,
    combatStats: {
        meleeDefence: number
        rangedDefence: number
        magicDefence: number
        health: number
    },
    hours: number,
    itemStore: ItemState,
    equippedItems: EquippedItems | undefined,
    elapsedTime: number,
    choiceId: number
) => {
    const actionChoice = isMelee
        ? allActionChoicesMelee[
              allActionChoiceIdsMelee.findIndex((x) => x === choiceId)
          ]
        : isRanged
          ? allActionChoicesRanged[
                allActionChoiceIdsRanged.findIndex((x) => x === choiceId)
            ]
          : allActionChoicesMagic[
                allActionChoiceIdsMagic.findIndex((x) => x === choiceId)
            ]
    const damagePerMinute = calculateDamage(
        attackSkill,
        isMelee
            ? m.combatStats.meleeDefence
            : isRanged
              ? m.combatStats.rangedDefence
              : isMagic
                ? m.combatStats.magicDefence
                : 0
    )
    const meleeDamagePerMinute = calculateDamage(
        m.combatStats.meleeAttack,
        combatStats.meleeDefence
    )
    const rangedDamagePerMinute = calculateDamage(
        m.combatStats.rangedAttack,
        combatStats.rangedDefence
    )
    const magicDamagePerMinute = calculateDamage(
        m.combatStats.magicAttack,
        combatStats.magicDefence
    )
    const damageTakenPerMinute =
        meleeDamagePerMinute + rangedDamagePerMinute + magicDamagePerMinute

    // Step 1, 2, and 3 from https://github.com/PaintSwap/estfor-contracts/blob/main/contracts/Players/PlayersLibrary.sol getCombatAdjustedElapsedTimes
    const totalMonstersSpawned = m.info.numSpawned * hours
    const respawnTime = (elapsedTime * 1000) / totalMonstersSpawned
    const damageDealt = (damagePerMinute * respawnTime) / 60
    const combatTimePerKill = Math.ceil(
        (m.combatStats.health * 60) / damagePerMinute
    )
    const canKillAll = damageDealt > m.combatStats.health
    let numKilled = 0
    let combatElapsedTime = 0
    if (canKillAll) {
        numKilled = (elapsedTime * totalMonstersSpawned) / (elapsedTime * 1000)
        const combatTimePerEnemy = Math.ceil(
            (m.combatStats.health * respawnTime) / damageDealt
        )
        combatElapsedTime = combatTimePerEnemy * numKilled
        combatElapsedTime += Math.min(
            combatTimePerEnemy,
            (elapsedTime - respawnTime) * numKilled
        )
    } else {
        numKilled = elapsedTime / combatTimePerKill
        combatElapsedTime = elapsedTime
    }

    const xpElapsedTime = respawnTime * numKilled

    // Step 2 - Consumables
    let itemsConsumed = 0
    if (actionChoice) {
        itemsConsumed = Math.ceil(
            (combatElapsedTime * actionChoice.rate) / (3600 * 1000)
        )
        if (actionChoice.rate !== 0) {
            itemsConsumed = Math.max(numKilled, itemsConsumed)
        }
    }

    // Step 3 - Health
    let totalHealthLost = (damageTakenPerMinute * combatElapsedTime) / 60
    if (totalHealthLost > combatStats.health) {
        totalHealthLost -= Math.max(0, combatStats.health)
    } else {
        totalHealthLost = 0
    }

    const fishHealthRestored =
        itemStore.items.find((x) => x.tokenId === equippedItems?.food)
            ?.healthRestored || 0

    const alphaCombatHealing = 8
    const healingScale = 1000000
    const healingFromHealthStat =
        healingScale +
        (((healingScale * alphaCombatHealing) / 100) * combatStats.health) / 100
    const totalFoodRequired = Math.max(
        1,
        Math.ceil(
            (totalHealthLost * healingScale) /
                (fishHealthRestored * healingFromHealthStat)
        )
    )
    const xpPerHour = (m.info.xpPerHour * xpElapsedTime) / elapsedTime

    return {
        totalFoodRequired,
        xpPerHour,
        totalHealthLost,
        damagePerMinute,
        meleeDamagePerMinute,
        rangedDamagePerMinute,
        magicDamagePerMinute,
        numKilled,
        itemsConsumed,
    }
}

export const monsterNames = {
    [EstforConstants.ACTION_COMBAT_NATUOW]: "Natuow",
    [EstforConstants.ACTION_COMBAT_ANCIENT_ENT]: "Ancient Ent",
    [EstforConstants.ACTION_COMBAT_ARCANE_DRAGON]: "Arcane Dragon",
    [EstforConstants.ACTION_COMBAT_BANOXNID]: "Banoxnid",
    [EstforConstants.ACTION_COMBAT_DRAGON_FROG]: "Dragon Frog",
    [EstforConstants.ACTION_COMBAT_DWELLER_BAT]: "Dweller Bat",
    [EstforConstants.ACTION_COMBAT_ELDER_BURGOF]: "Elder Burgof",
    [EstforConstants.ACTION_COMBAT_ELEMENTAL_DRAGON]: "Elemental Dragon",
    [EstforConstants.ACTION_COMBAT_ERKAD]: "Erkad",
    [EstforConstants.ACTION_COMBAT_GRAND_TREE_IMP]: "Grand Tree Imp",
    [EstforConstants.ACTION_COMBAT_GROG_TOAD]: "Grog Toad",
    [EstforConstants.ACTION_COMBAT_LOSSUTH]: "Lossuth",
    [EstforConstants.ACTION_COMBAT_NATURARACNID]: "Naturaracnid",
    [EstforConstants.ACTION_COMBAT_OBGORA]: "Obgora",
    [EstforConstants.ACTION_COMBAT_QRAKUR]: "Qrakur",
    [EstforConstants.ACTION_COMBAT_QUARTZ_EAGLE]: "Quartz Eagle",
    [EstforConstants.ACTION_COMBAT_ROCKHAWK]: "Rockhawk",
    [EstforConstants.ACTION_COMBAT_SNAPPER_BUG]: "Snapper Bug",
    [EstforConstants.ACTION_COMBAT_SNUFFLEQUARG]: "Snufflequarg",
    [EstforConstants.ACTION_COMBAT_SQUIGGLE_EGG]: "Squiggle Egg",
    [EstforConstants.ACTION_COMBAT_UFFINCH]: "Uffinch",
    [EstforConstants.ACTION_COMBAT_BLAZING_MONTANITE]: "Blazing Montanite",
    [EstforConstants.ACTION_COMBAT_CAVE_FAIRY]: "Cave Fairy",
    [EstforConstants.ACTION_COMBAT_EMBER_WHELP]: "Ember Whelp",
    [EstforConstants.ACTION_COMBAT_ICE_TROLL]: "Ice Troll",
    [EstforConstants.ACTION_COMBAT_JUVENILE_CAVE_FAIRY]: "Juvenile Cave Fairy",
    [EstforConstants.ACTION_COMBAT_MONTANITE_FIRE_TITAN]:
        "Montanite Fire Titan",
    [EstforConstants.ACTION_COMBAT_MONTANITE_ICE_TITAN]: "Montanite Ice Titan",
    [EstforConstants.ACTION_COMBAT_NIGHTMARE_GROG_TOAD]: "Nightmare Grog Toad",
    [EstforConstants.ACTION_COMBAT_NIGHTMARE_NATUOW]: "Nightmare Natuow",
    [EstforConstants.ACTION_COMBAT_NIGHTMARE_UFFINCH]: "Nightmare Uffinch",
}

export const monsterImageMap = {
    [EstforConstants.ACTION_COMBAT_NATUOW]: "monster_1_9zp1zn5o.jpg",
    [EstforConstants.ACTION_COMBAT_ANCIENT_ENT]: "monster_13_1fng96z1.jpg",
    [EstforConstants.ACTION_COMBAT_ARCANE_DRAGON]: "monster_3_th8l97g7.jpg",
    [EstforConstants.ACTION_COMBAT_BANOXNID]: "monster_9_lnrj57lu.jpg",
    [EstforConstants.ACTION_COMBAT_DRAGON_FROG]: "monster_2_t0stkk6h.jpg",
    [EstforConstants.ACTION_COMBAT_DWELLER_BAT]: "monster_18_wvkn2m5k.jpg",
    [EstforConstants.ACTION_COMBAT_ELDER_BURGOF]: "monster_12_yc0go5us.jpg",
    [EstforConstants.ACTION_COMBAT_ELEMENTAL_DRAGON]: "monster_4_huk1fhyk.jpg",
    [EstforConstants.ACTION_COMBAT_ERKAD]: "monster_15_bk1qmdjg.jpg",
    [EstforConstants.ACTION_COMBAT_GRAND_TREE_IMP]: "monster_10_w5jrjsdm.jpg",
    [EstforConstants.ACTION_COMBAT_GROG_TOAD]: "monster_6_4j6ln0up.jpg",
    [EstforConstants.ACTION_COMBAT_LOSSUTH]: "monster_21_d78nqouq.jpg",
    [EstforConstants.ACTION_COMBAT_NATURARACNID]: "monster_8_m1jngtk4.jpg",
    [EstforConstants.ACTION_COMBAT_OBGORA]: "monster_20_xzg4p2ow.jpg",
    [EstforConstants.ACTION_COMBAT_QRAKUR]: "monster_19_0c71r8c4.jpg",
    [EstforConstants.ACTION_COMBAT_QUARTZ_EAGLE]: "monster_16_pd6tft1a.jpg",
    [EstforConstants.ACTION_COMBAT_ROCKHAWK]: "monster_17_wvkn2m5k.jpg",
    [EstforConstants.ACTION_COMBAT_SNAPPER_BUG]: "monster_7_z8jt6i8q.jpg",
    [EstforConstants.ACTION_COMBAT_SNUFFLEQUARG]: "monster_11_ddmkmh7y.jpg",
    [EstforConstants.ACTION_COMBAT_SQUIGGLE_EGG]: "monster_14_5tnfLn.jpg",
    [EstforConstants.ACTION_COMBAT_UFFINCH]: "monster_5_jltmx4zq.jpg",
    [EstforConstants.ACTION_COMBAT_BLAZING_MONTANITE]:
        "monster_23_xe7wgjin.jpg",
    [EstforConstants.ACTION_COMBAT_CAVE_FAIRY]: "monster_25_s8uaum2x.jpg",
    [EstforConstants.ACTION_COMBAT_EMBER_WHELP]: "monster_22_zcfpzqp5.jpg",
    [EstforConstants.ACTION_COMBAT_ICE_TROLL]: "monster_27_8m5h2oi4.jpg",
    [EstforConstants.ACTION_COMBAT_JUVENILE_CAVE_FAIRY]:
        "monster_26_xg5eos4d.jpg",
    [EstforConstants.ACTION_COMBAT_MONTANITE_FIRE_TITAN]:
        "monster_24_b8lwohyf.jpg",
    [EstforConstants.ACTION_COMBAT_MONTANITE_ICE_TITAN]:
        "monster_30_fwn42nli.jpg",
    [EstforConstants.ACTION_COMBAT_NIGHTMARE_GROG_TOAD]: "monster_hell_02.jpg",
    [EstforConstants.ACTION_COMBAT_NIGHTMARE_NATUOW]: "monster_hell_01.jpg",
    [EstforConstants.ACTION_COMBAT_NIGHTMARE_UFFINCH]: "monster_hell_03.jpg",
}

export const useMonsterStore = defineStore("monsters", {
    state: () =>
        ({
            monsters: allActions.filter(
                (x) => x.info.skill === Skill.COMBAT && x.info.isAvailable
            ) as ActionInput[],
        }) as MonsterState,
    getters: {
        getKillsPerHour: () => {
            return (hours: number, hero: ProxySilo, monster: ActionInput) => {
                const itemStore = useItemStore()
                const decoded = safeDecode(
                    hero.savedTransactions[0].data,
                    "startActions"
                )

                const equippedItems: EquippedItems = {
                    rightHand: Number(decoded?.[1]?.[0]?.[4]),
                    leftHand: Number(decoded?.[1]?.[0]?.[5]),
                    food: Number(decoded?.[1]?.[0]?.[2]),
                    head: Number(decoded?.[1]?.[0]?.[0]?.[0]),
                    neck: Number(decoded?.[1]?.[0]?.[0]?.[1]),
                    body: Number(decoded?.[1]?.[0]?.[0]?.[2]),
                    arms: Number(decoded?.[1]?.[0]?.[0]?.[3]),
                    legs: Number(decoded?.[1]?.[0]?.[0]?.[4]),
                    feet: Number(decoded?.[1]?.[0]?.[0]?.[5]),
                    magicBag: Number(decoded?.[1]?.[0]?.[3]),
                    quiver: Number(decoded?.[1]?.[0]?.[3]),
                    ring: Number(decoded?.[1]?.[0]?.[0]?.[6]),
                    playerId: 0,
                    pet: undefined,
                }

                let isMelee =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.MELEE || false
                let isRanged =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.RANGED || false
                let isMagic =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.MAGIC || false

                const combatStats = itemStore.getTotalCombatStatsForHero(
                    hero,
                    equippedItems
                )

                const attackSkill = isMelee
                    ? combatStats.meleeAttack
                    : isRanged
                      ? combatStats.rangedAttack
                      : isMagic
                        ? combatStats.magicAttack
                        : 0
                const elapsedTime = hours * 3600
                return calculateMonsterDamage(
                    attackSkill,
                    isMelee,
                    isRanged,
                    isMagic,
                    monster,
                    combatStats,
                    hours,
                    itemStore,
                    equippedItems,
                    elapsedTime,
                    Number(decoded?.[1]?.[0]?.[3])
                )
            }
        },
        getKillsPerHourFromAction: () => {
            return (
                hours: number,
                hero: ProxySilo,
                action: QueuedAction,
                monster: ActionInput
            ) => {
                const itemStore = useItemStore()

                const equippedItems: EquippedItems = {
                    rightHand: action.rightHandEquipmentTokenId,
                    leftHand: action.leftHandEquipmentTokenId,
                    food: action.regenerateId,
                    head: action.headEquipped,
                    neck: action.neckEquipped,
                    body: action.bodyEquipped,
                    arms: action.armsEquipped,
                    legs: action.legsEquipped,
                    feet: action.feetEquipped,
                    magicBag: Number(action.choice.id),
                    quiver: Number(action.choice.id),
                    ring: action.ringEquipped,
                    playerId: 0,
                    pet: undefined,
                }

                let isMelee =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.MELEE || false
                let isRanged =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.RANGED || false
                let isMagic =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.MAGIC || false

                const combatStats = itemStore.getTotalCombatStatsForHero(
                    hero,
                    equippedItems
                )

                const attackSkill = isMelee
                    ? combatStats.meleeAttack
                    : isRanged
                      ? combatStats.rangedAttack
                      : isMagic
                        ? combatStats.magicAttack
                        : 0
                const elapsedTime = hours * 3600
                return calculateMonsterDamage(
                    attackSkill,
                    isMelee,
                    isRanged,
                    isMagic,
                    monster,
                    combatStats,
                    hours,
                    itemStore,
                    equippedItems,
                    elapsedTime,
                    Number(action.choice.id)
                )
            }
        },
        getMonsterRankings: (state: MonsterState) => {
            return (hours: number) => {
                const coreStore = useCoreStore()
                const itemStore = useItemStore()

                const equippedItems = itemStore.equippedItems.find(
                    (x) => x.playerId === Number(coreStore.playerId)
                )

                let isMelee =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.MELEE || false
                let isRanged =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.RANGED || false
                let isMagic =
                    itemStore.items.find(
                        (x) => x.tokenId === equippedItems?.rightHand
                    )?.skill === Skill.MAGIC || false

                const combatStats = itemStore.getTotalCombatStats

                const attackSkill = isMelee
                    ? combatStats.meleeAttack
                    : isRanged
                      ? combatStats.rangedAttack
                      : isMagic
                        ? combatStats.magicAttack
                        : 0
                const monsterRankings = []
                const elapsedTime = hours * 3600
                const choiceId = 0

                for (const m of state.monsters) {
                    const {
                        totalFoodRequired,
                        totalHealthLost,
                        xpPerHour,
                        damagePerMinute,
                        magicDamagePerMinute,
                        meleeDamagePerMinute,
                        rangedDamagePerMinute,
                    } = calculateMonsterDamage(
                        attackSkill,
                        isMelee,
                        isRanged,
                        isMagic,
                        m,
                        combatStats,
                        hours,
                        itemStore,
                        equippedItems,
                        elapsedTime,
                        choiceId
                    )

                    monsterRankings.push({
                        actionId: m.actionId,
                        name: monsterNames[m.actionId] || "Unknown",
                        damagePerMinute,
                        damageTakenPerHour: totalHealthLost,
                        meleeDamagePerMinute,
                        rangedDamagePerMinute,
                        magicDamagePerMinute,
                        xpPerHour,
                        combatStats: m.combatStats,
                        fishRequiredPerHour: totalFoodRequired,
                        imgSource: `${MEDIA_URL}/monsters/${
                            monsterImageMap[m.actionId] ||
                            "monster_1_9zp1zn5o.jpg"
                        }`,
                        guaranteedRewards: m.guaranteedRewards,
                        randomRewards: m.randomRewards,
                    })
                }

                monsterRankings.sort((a, b) => {
                    if (b.xpPerHour > a.xpPerHour) return 1
                    if (b.xpPerHour < a.xpPerHour) return -1

                    if (b.damageTakenPerHour > a.damageTakenPerHour) return -1
                    if (b.damageTakenPerHour < a.damageTakenPerHour) return 1

                    return 0
                })
                return monsterRankings
            }
        },
    },
    actions: {},
})
