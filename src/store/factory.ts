import {
    getAccount,
    multicall,
    readContract,
    waitForTransactionReceipt,
    writeContract,
    estimateGas,
} from "@wagmi/core"
import {
    ActionChoiceInput,
    ActionQueueStrategy,
    CombatStyle,
    GuaranteedReward,
    Player,
    QueuedAction,
    Skill,
    UserItemNFT,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"
import { zeroAddress } from "viem"

import {
    Address,
    getLevel,
    skillToXPMap,
    useCoreStore,
    safeDecode,
} from "./core"
import { encode } from "../utils/abi"
import { describeTxError } from "../utils/errors"

import estforPlayersAbi from "../abi/estforPlayer.json"
import estforPlayerAbi from "../abi/estforPlayer.json"
import itemNFTAbi from "../abi/itemNFT.json"
import estforPlayerNFTAbi from "../abi/estforPlayerNFT.json"
import bridgeAbi from "../abi/bridge.json"
import factoryAbi from "../abi/factoryRegistry.json"
import epProxyAbi from "../abi/epProxy.json"
import brushAbi from "../abi/brush.json"
import {
    PlayerSearchResult,
    UserItemNFTResult,
    getMultiPlayersByOwner,
    getMultiUserItemNFTs,
    getUserItemNFTs,
    searchQueuedActions,
} from "../utils/api"
import { allActions } from "../data/actions"
import { calculateChance } from "../utils/player"
import {
    actionChoiceNames,
    actionNames,
    getActionChoiceById,
    getCombatActionChoiceById,
    useSkillStore,
} from "./skills"
import { sleep } from "../utils/time"
import { config, type SonicChainId } from "../config"
import { useBroochStore } from "./brooch"
import { useMonsterStore } from "./monsters"
import {
    EquippedItems,
    FactoryState,
    NeededItem,
    ProxySilo,
    SavedTransaction,
    TransferUserItemNFT,
} from "./models/factory.models"
import { allItems } from "../data/items"

export const proxyNeedsItem = (item: UserItemNFT, p: ProxySilo): boolean => {
    for (const a of p.queuedActions) {
        if (a.feetEquipped === item.tokenId) {
            return true
        }
        if (a.armsEquipped === item.tokenId) {
            return true
        }
        if (a.bodyEquipped === item.tokenId) {
            return true
        }
        if (a.headEquipped === item.tokenId) {
            return true
        }
        if (a.leftHandEquipmentTokenId === item.tokenId) {
            return true
        }
        if (a.rightHandEquipmentTokenId === item.tokenId) {
            return true
        }
        if (a.legsEquipped === item.tokenId) {
            return true
        }
        if (a.neckEquipped === item.tokenId) {
            return true
        }
        if (a.ringEquipped === item.tokenId) {
            return true
        }
    }
    for (const a of p.savedTransactions) {
        const decoded = safeDecode(a.data, "startActions")
        const action = decoded?.[1]?.[0]
        const equippedItems: EquippedItems = {
            rightHand: Number(action?.rightHandEquipmentTokenId),
            leftHand: Number(action?.leftHandEquipmentTokenId),
            food: Number(action?.regenerateId),
            head: Number(action?.attire?.head),
            neck: Number(action?.attire?.neck),
            body: Number(action?.attire?.body),
            arms: Number(action?.attire?.arms),
            legs: Number(action?.attire?.legs),
            feet: Number(action?.attire?.feet),
            ring: Number(action?.attire?.ring),
            magicBag: 0,
            quiver: 0,
            playerId: 0,
            pet: undefined,
        }
        if (equippedItems.feet === item.tokenId) {
            return true
        }
        if (equippedItems.arms === item.tokenId) {
            return true
        }
        if (equippedItems.body === item.tokenId) {
            return true
        }
        if (equippedItems.head === item.tokenId) {
            return true
        }
        if (equippedItems.leftHand === item.tokenId) {
            return true
        }
        if (equippedItems.rightHand === item.tokenId) {
            return true
        }
        if (equippedItems.legs === item.tokenId) {
            return true
        }
        if (equippedItems.neck === item.tokenId) {
            return true
        }
        if (equippedItems.ring === item.tokenId) {
            return true
        }
    }
    return false
}

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

export const getIncomingItems = (proxys: ProxySilo[]) => {
    const items: GuaranteedReward[] = []
    const monsterStore = useMonsterStore()
    for (const s of proxys) {
        const decoded = safeDecode(s.savedTransactions[0].data, "startActions")
        const actionId = decoded?.[1]?.[0]?.actionId || BigInt(0)
        const actionChoiceId = decoded?.[1]?.[0]?.choiceId || BigInt(0)
        const action = allActions.find((a) => a.actionId === Number(actionId))
        const actionChoice = getActionChoiceById(
            Number(actionId),
            Number(actionChoiceId)
        )
        if (action) {
            const isCombat = action.info.skill === Skill.COMBAT
            let amountMultiplier = 1
            if (isCombat) {
                const { numKilled } = monsterStore.getKillsPerHour(
                    24,
                    s,
                    action
                )
                amountMultiplier = numKilled / 24
            }

            for (const i of action.guaranteedRewards) {
                const existing = items.find(
                    (x) => x.itemTokenId === i.itemTokenId
                )
                if (existing) {
                    existing.rate += (i.rate / 10) * amountMultiplier
                } else {
                    items.push({ ...i, rate: (i.rate / 10) * amountMultiplier })
                }
            }
            for (const i of action.randomRewards) {
                const existing = items.find(
                    (x) => x.itemTokenId === i.itemTokenId
                )
                if (existing) {
                    existing.rate +=
                        (calculateChance(
                            i,
                            action,
                            // @ts-ignore
                            s.playerState[skillToXPMap[action.info.skill]]
                        ) /
                            100) *
                        i.amount *
                        amountMultiplier
                } else {
                    items.push({
                        ...i,
                        rate:
                            (calculateChance(
                                i,
                                action,
                                // @ts-ignore
                                s.playerState[skillToXPMap[action.info.skill]]
                            ) /
                                100) *
                            i.amount *
                            amountMultiplier,
                    })
                }
            }
        }
        if (actionChoice) {
            const existing = items.find(
                (x) => x.itemTokenId === actionChoice.outputTokenId
            )
            if (existing) {
                existing.rate +=
                    actionChoice.outputAmount *
                    (actionChoice.rate / 1000) *
                    calculateActionChoiceSuccessPercent(
                        actionChoice,
                        // @ts-ignore
                        s.playerState[skillToXPMap[actionChoice.skill]],
                        actionChoice.skill
                    )
            } else {
                items.push({
                    itemTokenId: actionChoice.outputTokenId,
                    rate:
                        actionChoice.outputAmount *
                        (actionChoice.rate / 1000) *
                        calculateActionChoiceSuccessPercent(
                            actionChoice,
                            // @ts-ignore
                            s.playerState[skillToXPMap[actionChoice.skill]],
                            actionChoice.skill
                        ),
                })
            }
        }
    }
    return items
}

export const getOutgoingItems = (proxys: ProxySilo[]) => {
    const items: GuaranteedReward[] = []
    const monsterStore = useMonsterStore()
    for (const s of proxys) {
        const decoded = safeDecode(s.savedTransactions[0].data, "startActions")
        const actionId = decoded?.[1]?.[0]?.actionId || BigInt(0)
        const food = decoded?.[1]?.[0]?.regenerateId || BigInt(0)
        const actionChoiceId = decoded?.[1]?.[0]?.choiceId || BigInt(0)
        const action = allActions.find((a) => a.actionId === Number(actionId))
        const actionChoice = getActionChoiceById(
            Number(actionId),
            Number(actionChoiceId)
        )
        if (action) {
            const isCombat = action.info.skill === Skill.COMBAT
            if (isCombat) {
                const { totalFoodRequired, itemsConsumed } =
                    monsterStore.getKillsPerHour(24, s, action)
                {
                    const existing = items.find(
                        (x) => x.itemTokenId === Number(food)
                    )
                    if (existing) {
                        existing.rate += totalFoodRequired / 24
                    } else {
                        items.push({
                            itemTokenId: Number(food),
                            rate: totalFoodRequired / 24,
                        })
                    }
                }

                if (itemsConsumed > 0) {
                    const actionChoice = getCombatActionChoiceById(
                        Number(actionChoiceId)
                    )
                    if (actionChoice) {
                        let i = 0
                        for (const input of actionChoice.inputTokenIds) {
                            const existing = items.find(
                                (x) => x.itemTokenId === input
                            )
                            if (existing) {
                                existing.rate += itemsConsumed / 24
                            } else {
                                items.push({
                                    itemTokenId: input,
                                    rate: itemsConsumed / 24,
                                })
                            }
                            i++
                        }
                    }
                }
            }
        }
        if (actionChoice) {
            let i = 0
            for (const input of actionChoice.inputTokenIds) {
                const existing = items.find((x) => x.itemTokenId === input)
                if (existing) {
                    existing.rate +=
                        actionChoice.inputAmounts[i] *
                        (actionChoice.rate / 1000)
                } else {
                    items.push({
                        itemTokenId: input,
                        rate:
                            actionChoice.inputAmounts[i] *
                            (actionChoice.rate / 1000),
                    })
                }
                i++
            }
        }
    }
    return items
}

const constructQueuedActions = (
    actionId: number,
    choiceId: number,
    head: number | undefined,
    neck: number | undefined,
    body: number | undefined,
    arms: number | undefined,
    legs: number | undefined,
    feet: number | undefined,
    ring: number | undefined,
    food: number | undefined,
    leftHand: number | undefined,
    rightHand: number | undefined,
    combatStyle: CombatStyle
): any[] => {
    return [
        [
            [
                head || 0, // head
                neck || 0, // neck
                body || 0, // body
                arms || 0, // arms
                legs || 0, // legs
                feet || 0, // feet
                ring || 0, // ring
                0, // reserved1
            ],
            actionId,
            food || 0, // food
            choiceId, // choice id
            rightHand || 0, // weapon or tool
            leftHand || 0, // shield
            60 * 60 * 24, // 24 hours
            combatStyle, // NONE / ATTACK / DEFENCE,
            0, // petId
        ],
    ]
}

export const calculateExtraXPForHeroActionInput = (
    h: ProxySilo,
    skillId: Skill
): {
    extraXP: number
    defenceXP: number
    magicXP: number
    meleeXP: number
    rangedXP: number
} => {
    const skillStore = useSkillStore()
    const monsterStore = useMonsterStore()
    const relevantActions = h.queuedActions.filter((x) => x.skill == skillId)
    let extraXP = 0
    let defenceXP = 0
    let magicXP = 0
    let meleeXP = 0
    let rangedXP = 0
    const timenow = Date.now() / 1000
    for (const action of relevantActions) {
        const a = skillStore
            .getActionInputsForSkill(skillId)
            .find((s) => s.actionId == action.actionId)
        if (!a) {
            continue
        }
        if (parseInt(action.startTime) + action.timespan < timenow) {
            if (action.skill === Skill.COMBAT) {
                const { xpPerHour } = monsterStore.getKillsPerHour(
                    action.timespan / 60 / 60,
                    h,
                    a
                )
                if (action.combatStyle === CombatStyle.DEFENCE) {
                    defenceXP += xpPerHour * (action.timespan / 60 / 60)
                } else {
                    const rightHand = allItems.find(
                        (x) => x.tokenId === action.rightHandEquipmentTokenId
                    )
                    if (rightHand) {
                        if (rightHand.skill === Skill.MAGIC) {
                            magicXP += xpPerHour * (action.timespan / 60 / 60)
                        } else if (rightHand.skill === Skill.MELEE) {
                            meleeXP += xpPerHour * (action.timespan / 60 / 60)
                        } else if (rightHand.skill === Skill.RANGED) {
                            rangedXP += xpPerHour * (action.timespan / 60 / 60)
                        }
                    }
                }
            } else {
                extraXP += a.info.xpPerHour * (action.timespan / 60 / 60)
            }
        } else if (parseInt(action.startTime) < timenow) {
            const timeInAction = timenow - parseInt(action.startTime)
            if (action.skill === Skill.COMBAT) {
                const { xpPerHour } = monsterStore.getKillsPerHour(
                    timeInAction / 60 / 60,
                    h,
                    a
                )
                if (action.combatStyle === CombatStyle.DEFENCE) {
                    defenceXP += xpPerHour * (timeInAction / 60 / 60)
                } else {
                    const rightHand = allItems.find(
                        (x) => x.tokenId === action.rightHandEquipmentTokenId
                    )
                    if (rightHand) {
                        if (rightHand.skill === Skill.MAGIC) {
                            magicXP += xpPerHour * (timeInAction / 60 / 60)
                        } else if (rightHand.skill === Skill.MELEE) {
                            meleeXP += xpPerHour * (timeInAction / 60 / 60)
                        } else if (rightHand.skill === Skill.RANGED) {
                            rangedXP += xpPerHour * (timeInAction / 60 / 60)
                        }
                    }
                }
            } else {
                extraXP += a.info.xpPerHour * (timeInAction / 60 / 60)
            }
        }
    }
    return { extraXP, defenceXP, magicXP, meleeXP, rangedXP }
}

export const calculateExtraXPForHeroActionChoiceInput = (
    h: ProxySilo,
    skillId: Skill
): number => {
    const skillStore = useSkillStore()
    const relevantActions = h.queuedActions.filter((x) => x.skill == skillId)
    let extraXP = 0
    const timenow = Date.now() / 1000
    for (const action of relevantActions) {
        const a = skillStore
            .getActionChoiceInputsForSkill(skillId)
            .find((s) => s === Number(action.choice.id))
        if (!a) {
            continue
        }
        if (parseInt(action.startTime) + action.timespan < timenow) {
            extraXP += action.choice.xpPerHour * (action.timespan / 60 / 60)
        } else if (parseInt(action.startTime) < timenow) {
            const timeInAction = timenow - parseInt(action.startTime)
            extraXP += action.choice.xpPerHour * (timeInAction / 60 / 60)
        }
    }
    return extraXP
}

export const decodeTransaction = (savedTransactions: SavedTransaction[]) => {
    if (savedTransactions.length === 0) {
        return "No action"
    }

    // first transaction is the action queue
    const decoded = safeDecode(savedTransactions[0].data, "startActions")

    // [playerId, actions[[attire, actionId, regenId, choiceId], [], []], action queue type]
    const actionId = decoded?.[1]?.[0]?.actionId || BigInt(0)
    const choiceId = decoded?.[1]?.[0]?.choiceId || BigInt(0)
    return (
        actionNames[Number(actionId)] ||
        actionChoiceNames[Number(choiceId)] ||
        "Unknown"
    )
}

export const decodeSkillFromTransaction = (
    savedTransactions: SavedTransaction[]
) => {
    if (savedTransactions.length === 0) {
        return "No action"
    }

    // first transaction is the action queue
    const decoded = safeDecode(savedTransactions[0].data, "startActions")

    // [playerId, actions[[attire, actionId, regenId, choiceId], [], []], action queue type]

    const actionId = decoded?.[1]?.[0]?.actionId || BigInt(0)
    const action = allActions.find((a) => a.actionId === Number(actionId))
    return action?.info.skill || Skill.NONE
}

const getChunksForMulticall = async (
    data: any[],
    to: string,
    factoryAbi: any,
    chunks: number,
    value: bigint,
    chainId: SonicChainId,
    gasLimit: bigint = BigInt(6000000)
) => {
    let attempts = 0
    let actualChunks = Math.min(chunks, data.length)
    let success = false
    while (!success) {
        try {
            const splits = Math.ceil(data.length / actualChunks)
            for (let i = 0; i < splits; i++) {
                const payload: any = {
                    account: getAccount(config).address,
                    to: to as `0x${string}`,
                    data: encode(factoryAbi, "multicall", [
                        data.slice(i * actualChunks, (i + 1) * actualChunks),
                    ]),
                    chainId,
                    type: "legacy", // ftm is lame
                }
                if (value > BigInt(0)) {
                    payload.value = value
                }
                const result = await estimateGas(config, payload)
                if (result > gasLimit) {
                    throw new Error(`Gas estimate too high: ${result} >${gasLimit}`)
                }
            }
            success = true
        } catch (e) {
            if (actualChunks <= 8) {
                actualChunks -= 1
            } else if (actualChunks <= 16) {
                actualChunks -= 2
            } else {
                actualChunks -= 5
            }
            attempts++
            if (actualChunks < 1 || attempts > 20) {
                console.error(
                    "Multicall gas estimation failed after retries:",
                    describeTxError(e),
                    e
                )
                throw new Error("Failed to estimate gas")
            }
        }
    }
    return actualChunks
}

export const useFactoryStore = defineStore("factory", {
    state: () =>
        ({
            proxys: [] as ProxySilo[],
            initialised: false,
            initialisedAt: null,
            bankItems: [] as UserItemNFT[],
            totalTransactionNumber: 0,
            currentTransactionNumber: 0,
            transactionCharge: BigInt(0),
        }) as FactoryState,
    getters: {
        emptyProxys(state: FactoryState) {
            return state.proxys.filter((p) => p.playerId === "")
        },
        unassignedProxys(state: FactoryState) {
            return state.proxys.filter(
                (p) => p.playerId !== "" && p.savedTransactions.length === 0
            )
        },
        assignedProxys(state: FactoryState) {
            return state.proxys.filter(
                (p) => p.playerId !== "" && p.savedTransactions.length > 0
            )
        },
        bank(state: FactoryState) {
            // get the lowest id from this.proxys
            const ids = state.proxys.map((p) => p.index)
            ids.sort()

            return state.proxys.find((p) => p.index === ids[0])
        },
    },
    actions: {
        reset() {
            this.initialised = false
            this.proxys = []
            this.bankItems = []
            this.totalTransactionNumber = 0
            this.currentTransactionNumber = 0
            this.initialisedAt = null
        },
        async setActive(siloAddress: string, playerId: string) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playersAddress = coreStore.getAddress(Address.estforPlayers)
            const account = getAccount(config)

            if (!factoryAddress || !playersAddress || !account.isConnected) {
                return
            }

            const data = encode(estforPlayerAbi, "setActivePlayer", [
                BigInt(playerId),
            ])

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "execute",
                args: [siloAddress, playersAddress, data],
                type: "legacy",
            })

            await waitForTransactionReceipt(config, { hash })
        },
        async transferHero(
            siloAddress: string,
            playerId: string,
            toAddress: string
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT
            )
            const account = getAccount(config)

            if (!factoryAddress || !playerNFTAddress || !account.isConnected) {
                return
            }

            const data = encode(
                estforPlayerNFTAbi,
                "safeTransferFrom",
                [siloAddress, toAddress, BigInt(playerId), 1, "0x"]
            )

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "execute",
                args: [siloAddress, playerNFTAddress, data],
                type: "legacy",
            })

            await waitForTransactionReceipt(config, { hash })
        },
        async withdrawHeroes(
            proxys: ProxySilo[],
            chainId: SonicChainId,
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry)
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT
            )
            const account = getAccount(config)

            if (!factoryAddress || !playerNFTAddress || !account.isConnected || account.chainId !== chainId) {
                return
            }

            const selectorArray = proxys.map((h) =>
                encode(factoryAbi, "execute", [
                    h.address,
                    playerNFTAddress,
                    encode(estforPlayerNFTAbi, "safeTransferFrom", [
                        h.address,
                        account.address,
                        BigInt(h.playerId),
                        1,
                        "0x",
                    ]),
                ])
            )

            await this.multicall(selectorArray, chainId, false)
        },
        async depositHeroes(heroes: { playerId: string, assignedSilo: string }[], chainId: SonicChainId) {
            const coreStore = useCoreStore()
            const playerNFTAddress = coreStore.getAddress(Address.estforPlayerNFT, chainId)
            const factoryRegistryAddress = coreStore.getAddress(Address.factoryRegistry, chainId)
            const playersAddress = coreStore.getAddress(Address.estforPlayers, chainId)
            const account = getAccount(config)
            if (!playerNFTAddress || !factoryRegistryAddress || !playersAddress || !account.isConnected || account.chainId !== chainId) {
                return
            }

            const delegateSilo = this.bank?.address
            if (!delegateSilo) {
                return
            }

            const isApproved = await readContract(config, {
                address: playerNFTAddress as `0x${string}`,
                abi: estforPlayerNFTAbi,
                functionName: "isApprovedForAll",
                args: [account.address, delegateSilo],
                chainId,
            })
            if (!isApproved) {
                const hash = await writeContract(config, {
                    address: playerNFTAddress as `0x${string}`,
                    abi: estforPlayerNFTAbi,
                    functionName: "setApprovalForAll",
                    args: [delegateSilo, true],
                    type: "legacy",
                    chainId,
                })
                await waitForTransactionReceipt(config, { hash, chainId })
            }

            const selectorArray = heroes.map((h) =>
                encode(factoryAbi, "execute", [
                    delegateSilo,
                    playerNFTAddress,
                    encode(estforPlayerNFTAbi, "safeTransferFrom", [
                        account.address,
                        h.assignedSilo,
                        BigInt(h.playerId),
                        1,
                        "0x",
                    ]),
                ])
            )

            await this.multicall(selectorArray, chainId, false)

            // now activate all heroes on each silo
            const activateSelectorArray = heroes.map((h) =>
                encode(factoryAbi, "execute", [
                    h.assignedSilo,
                    playersAddress,
                    encode(estforPlayersAbi, "setActivePlayer", [
                        BigInt(h.playerId),
                    ]),
                ])
            )
            await this.multicall(activateSelectorArray, chainId, false)

            await sleep(2000)
            await this.getAllProxyStates(chainId)
        },
        async activateHeroes(heroes: { address: string, playerId: string }[], chainId: SonicChainId) {
            const coreStore = useCoreStore()
            const playersAddress = coreStore.getAddress(Address.estforPlayers, chainId)
            const factoryAddress = coreStore.getAddress(Address.factoryRegistry, chainId)
            const account = getAccount(config)

            if (!playersAddress || !factoryAddress || !account.isConnected || account.chainId !== chainId) {
                return
            }

            const selectorArray = heroes.map((h) =>
                encode(factoryAbi, "execute", [
                    h.address,
                    playersAddress,
                    encode(estforPlayersAbi, "setActivePlayer", [
                        BigInt(h.playerId),
                    ]),
                ])
            )
            await this.multicall(selectorArray, chainId, false)
            await sleep(2000)
            await this.getAllProxyStates(chainId)
        },
        async mintHeroes(heroes: any[], chainId: SonicChainId) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !playerNFTAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const emptyProxies = this.emptyProxys
            if (emptyProxies.length < heroes.length) {
                throw new Error("Not enough empty proxies")
            }

            const selectorArray = heroes.map((h, i) =>
                encode(factoryAbi, "execute", [
                    emptyProxies[i].address,
                    playerNFTAddress,
                    encode(estforPlayerNFTAbi, "mint", [
                        h.avatarId,
                        h.name,
                        "",
                        "",
                        "",
                        false,
                        true,
                    ]),
                ])
            )

            await this.multicall(selectorArray, chainId, false)
            await this.getAllProxyStates(chainId)
        },
        async multicall(
            data: any[],
            chainId: SonicChainId,
            fastCall: boolean,
            chunks = 10,
            value: bigint = BigInt(0),
            gasLimit: bigint = BigInt(6000000)
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )

            if (!factoryAddress) {
                return
            }

            const actualChunks = await getChunksForMulticall(
                data,
                factoryAddress,
                factoryAbi,
                chunks,
                value,
                chainId,
                gasLimit
            )
            const splits = Math.ceil(data.length / actualChunks)
            this.totalTransactionNumber = splits
            try {
                if (fastCall) {
                    let latestHash
                    for (let i = 0; i < splits; i++) {
                        this.currentTransactionNumber = i + 1
                        const payload: any = {
                            address: factoryAddress as `0x${string}`,
                            abi: factoryAbi,
                            functionName: "multicall",
                            args: [
                                data.slice(
                                    i * actualChunks,
                                    (i + 1) * actualChunks
                                ),
                            ],
                            type: "legacy",
                            chainId,
                        }
                        if (value > BigInt(0)) {
                            payload.value = value
                        }
                        latestHash = await writeContract(config, payload)
                    }
                    if (latestHash) {
                        await waitForTransactionReceipt(config, {
                            hash: latestHash,
                            chainId,
                        })
                    }
                } else {
                    for (let i = 0; i < splits; i++) {
                        this.currentTransactionNumber = i + 1
                        const payload: any = {
                            address: factoryAddress as `0x${string}`,
                            abi: factoryAbi,
                            functionName: "multicall",
                            args: [
                                data.slice(
                                    i * actualChunks,
                                    (i + 1) * actualChunks
                                ),
                            ],
                            type: "legacy",
                            chainId,
                        }
                        if (value > BigInt(0)) {
                            payload.value = value
                        }
                        const hash = await writeContract(config, payload)
                        await waitForTransactionReceipt(config, { hash, chainId })
                    }
                }
            } catch (e) {
                throw e
            } finally {
                this.totalTransactionNumber = 0
                this.currentTransactionNumber = 0
            }
        },
        async approveBrush(
            proxys: ProxySilo[],
            amount: bigint,
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const brushAddress = coreStore.getAddress(Address.brush, chainId)
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !brushAddress ||
                !playerNFTAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const selectorArray = proxys.map((h) =>
                encode(factoryAbi, "execute", [
                    h.address,
                    brushAddress,
                    encode(brushAbi, "approve", [playerNFTAddress, amount]),
                ])
            )

            await this.multicall(selectorArray, chainId, false)
        },
        async sendBrush(
            proxys: ProxySilo[],
            amount: bigint,
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const brushAddress = coreStore.getAddress(Address.brush, chainId)
            const account = getAccount(config)
            if (
                !brushAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            try {
                this.totalTransactionNumber = proxys.length
                this.currentTransactionNumber = 0
                for (const p of proxys) {
                    this.currentTransactionNumber++
                    const hash = await writeContract(config, {
                        address: brushAddress as `0x${string}`,
                        abi: brushAbi as any,
                        functionName: "transfer",
                        args: [p.address, amount],
                        chainId,
                    })
                    await waitForTransactionReceipt(config, { hash })
                }
            } catch (e) {
                throw e
            } finally {
                this.totalTransactionNumber = 0
                this.currentTransactionNumber = 0
            }
        },
        async evolveHeroes(proxys: ProxySilo[], chainId: SonicChainId) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const playerNFTAddress = coreStore.getAddress(
                Address.estforPlayerNFT,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !playerNFTAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const selectorArray = proxys.map((h) =>
                encode(factoryAbi, "execute", [
                    h.address,
                    playerNFTAddress,
                    encode(estforPlayerNFTAbi, "editPlayer", [
                        BigInt(h.playerId),
                        h.playerState.name,
                        "",
                        "",
                        "",
                        true,
                    ]),
                ])
            )

            await this.multicall(selectorArray, chainId, false)
        },
        async getAllProxyStates(chainId: SonicChainId, proxys: ProxySilo[] = []) {
            const coreStore = useCoreStore()
            const playerAddress = coreStore.getAddress(
                Address.estforPlayers,
                chainId
            )
            const account = getAccount(config)
            if (
                !playerAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            if (proxys.length === 0) {
                proxys = this.proxys
            }

            const proxyContract = {
                abi: epProxyAbi,
                chainId: chainId,
            }

            const playerPromises: PlayerSearchResult = await getMultiPlayersByOwner(this.proxys.map(p => p.address))

            const proxysWithPlayerId = this.proxys.map((p) => {
                const result = playerPromises.players.filter(
                    (x) =>
                        x.owner?.toLowerCase() === p.address.toLowerCase()
                )
                return {
                    ...p,
                    playerId:
                        result?.find((x) => x.isActive)?.tokenId || "",
                    allPlayers: result || [],
                    playerState:
                        result?.find((x) => x.isActive) ||
                        ({} as Player),
                }
            })

            const playerIdsToGet = proxysWithPlayerId
                .filter((p) => p.playerId !== "")
                .map((p) => p.playerId)
            if (playerIdsToGet.length > 0) {
                const queuedActionsResult = await searchQueuedActions(playerIdsToGet)

                const proxyData = await multicall(config, {
                    contracts: proxysWithPlayerId.map(
                        (p) =>
                            ({
                                ...proxyContract,
                                address: p.address,
                                functionName: "getAllSavedTransactions",
                                args: [],
                            }) as any
                    ),
                    chainId,
                })

                const proxyPauseData = await multicall(config, {
                    contracts: proxysWithPlayerId.map(
                        (p) =>
                            ({
                                ...proxyContract,
                                address: p.address,
                                functionName: "isPaused",
                                args: [],
                            }) as any
                    ),
                    chainId,
                })

                this.proxys = proxysWithPlayerId.map((p, i) => ({
                    ...p,
                    queuedActions: queuedActionsResult.queuedActions
                        .filter((x) =>
                            x.playerId === p.playerId
                        )
                        .flat(),
                    savedTransactions: proxyData[i]
                        .result as SavedTransaction[],
                    isPaused: proxyPauseData[i].result as boolean,
                }))
            } else {
                this.proxys = proxysWithPlayerId.map((p) => ({
                    ...p,
                    queuedActions: [],
                    savedTransactions: [],
                    isPaused: true,
                }))
            }

            await this.getBankItems()
            await this.getTransactionCharge(chainId)
            this.initialised = true
            this.initialisedAt = new Date()
        },
        async getTransactionCharge(chainId: SonicChainId) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            if (!factoryAddress) {
                return
            }

            const result = await readContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "transactionCharge",
                args: [],
                chainId,
            })
            this.transactionCharge = result as bigint
        },
        async createProxy(proxyNumber: number, chainId: SonicChainId) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            proxyNumber = Math.floor(proxyNumber)
            const data = encode(factoryAbi, "createProxy", [])
            const selectorArray = Array.from({ length: proxyNumber }, () => data)

            const factoryContract = {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                chainId,
            }

            const actualChunks = await getChunksForMulticall(
                selectorArray,
                factoryAddress,
                factoryAbi,
                15,
                BigInt(0),
                chainId
            )
            const splits = Math.ceil(proxyNumber / actualChunks)
            this.totalTransactionNumber = splits
            try {
                for (let i = 0; i < splits; i++) {
                    this.currentTransactionNumber = i + 1
                    const hash = await writeContract(config, {
                        ...factoryContract,
                        functionName: "multicall",
                        args: [
                            selectorArray.slice(
                                i * actualChunks,
                                (i + 1) * actualChunks
                            ),
                        ],
                        type: "legacy",
                        chainId,
                    })
                    await waitForTransactionReceipt(config, { hash })
                }
            } catch (e) {
                throw e
            } finally {
                this.totalTransactionNumber = 0
                this.currentTransactionNumber = 0
            }
        },
        async setProxys(proxys: any[]) {
            const account = getAccount(config)

            this.proxys = proxys
                .filter((value, index, self) => {
                    return (
                        self.findIndex((v) => v.proxy === value.proxy) === index
                    )
                })
                .map((d) => {
                    // Fix for pre-event proxys with the same id
                    let proxyId = d.proxyId
                    let sameProxyIds = proxys.filter(
                        (p) => p.proxyId === d.proxyId
                    )
                    if (sameProxyIds.length > 1) {
                        sameProxyIds.sort((a, b) => {
                            if (a.proxy > b.proxy) {
                                return 1
                            }
                            if (a.proxy < b.proxy) {
                                return -1
                            }
                            return 0
                        })
                        proxyId = (
                            Number(proxyId) +
                            sameProxyIds.findIndex((p) => p.proxy === d.proxy) -
                            sameProxyIds.length +
                            1
                        ).toString()
                    }
                    return {
                        address: d.proxy,
                        index: proxyId,
                        allPlayers: [],
                        playerId: "",
                        playerState: {} as Player,
                        queuedActions: [] as QueuedAction[],
                        owner: account.address as string,
                        isPaused: true,
                        savedTransactions: [] as SavedTransaction[],
                    }
                })

            this.proxys.sort((a, b) => {
                if (Number(a.index) > Number(b.index)) {
                    return 1
                }
                if (Number(a.index) < Number(b.index)) {
                    return -1
                }
                return 0
            })
        },
        setQueuedActions(proxy: string, queuedActions: QueuedAction[]) {
            const proxyToUpdate = this.proxys.find((p) => p.address === proxy)
            if (proxyToUpdate) {
                proxyToUpdate.queuedActions = queuedActions
            }
        },
        async getProxys(chainId: SonicChainId, force = true) {
            if (
                !force &&
                this.initialised &&
                this.initialisedAt &&
                new Date().getTime() - this.initialisedAt.getTime() <
                    1000 * 60 * 10
            ) {
                return
            }

            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const account = getAccount(config)
            if (!factoryAddress || !account.isConnected) {
                return
            }

            const factoryContract = {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                chainId,
            }

            const totalAddressCount: bigint = (await readContract(config, {
                ...factoryContract,
                functionName: "totalAddressCount",
                args: [],
            })) as bigint

            const data = await multicall(config, {
                contracts: Array.from(
                    { length: Number(totalAddressCount) },
                    (_, i) =>
                        ({
                            ...factoryContract,
                            functionName: "proxyAddressOfOwnerByIndex",
                            args: [account.address, i],
                        }) as any
                ),
            })
            this.proxys.push(
                ...data
                    .map((d, i) => ({
                        address: d.result as string,
                        index: i,
                        playerId: "",
                        allPlayers: [],
                        playerState: {} as Player,
                        queuedActions: [] as QueuedAction[],
                        owner: account.address as string,
                        isPaused: true,
                        savedTransactions: [] as SavedTransaction[],
                    }))
                    .filter((d: any) => d.address !== zeroAddress)
            )
        },
        async assignActionToProxy(
            proxys: ProxySilo[],
            actionId: number,
            choiceId: number,
            head: number | undefined,
            neck: number | undefined,
            body: number | undefined,
            arms: number | undefined,
            legs: number | undefined,
            feet: number | undefined,
            ring: number | undefined,
            rightHand: number | undefined,
            leftHand: number | undefined,
            food: number | undefined,
            combatStyle: CombatStyle,
            actionQueueStatus: ActionQueueStrategy,
            activate: boolean,
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const playersAddress = coreStore.getAddress(
                Address.estforPlayers,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !playersAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const selectorArray = proxys.map((h) =>
                encode(factoryAbi, "setTransaction", [
                    h.address,
                    0,
                    playersAddress,
                    encode(estforPlayerAbi, "startActions", [
                        BigInt(h.playerState.id),
                        constructQueuedActions(
                            actionId,
                            choiceId,
                            head,
                            neck,
                            body,
                            arms,
                            legs,
                            feet,
                            ring,
                            food,
                            leftHand,
                            rightHand,
                            combatStyle
                        ),
                        actionQueueStatus,
                    ]),
                ])
            )

            const pauseArray = proxys
                .filter((h) => h.isPaused === activate)
                .map((h) =>
                    encode(factoryAbi, "setPaused", [h.address, !activate])
                )

            const combined = [...pauseArray, ...selectorArray]

            await this.multicall(combined, chainId, false, 40)

            // update savedTransactions and isPaused in state
            let i = 0
            for (const p of proxys) {
                const proxy = this.proxys.find((x) => x.address === p.address)
                if (proxy) {
                    proxy.savedTransactions = [
                        {
                            to: playersAddress,
                            data: encode(estforPlayerAbi, "startActions", [
                                BigInt(p.playerState.id),
                                constructQueuedActions(
                                    actionId,
                                    choiceId,
                                    head,
                                    neck,
                                    body,
                                    arms,
                                    legs,
                                    feet,
                                    ring,
                                    food,
                                    leftHand,
                                    rightHand,
                                    combatStyle
                                ),
                                actionQueueStatus,
                            ]),
                        },
                    ]
                    proxy.isPaused = !activate
                }
                i++
            }
        },
        async transferItemsFromBankToProxys(
            itemsNeeded: NeededItem[],
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const itemAddress = coreStore.getAddress(Address.itemNFT, chainId)
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !itemAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }
            if (itemsNeeded.length > 0) {
                const fromAddress = this.bank?.address

                const selectorArray = itemsNeeded.map((i) =>
                    encode(factoryAbi, "execute", [
                        fromAddress,
                        itemAddress,
                        encode(itemNFTAbi, "safeBatchTransferFrom", [
                            fromAddress,
                            i.address,
                            i.items.map((i) => i.tokenId),
                            i.items.map((i) => BigInt(i.amount)),
                            "0x",
                        ]),
                    ])
                )

                await this.multicall(selectorArray, chainId, false, 40)
            }
            await this.getBankItems()
        },
        async processActions(
            proxys: ProxySilo[],
            fastCall: boolean,
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const playersAddress = coreStore.getAddress(Address.estforPlayers, chainId)
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !playersAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const selectorArray = proxys.map((h) =>
                encode(factoryAbi, "execute", [
                    h.address,
                    playersAddress,
                    encode(estforPlayerAbi, "processActions", [
                        BigInt(h.playerId),
                    ]),
                ])
            )

            await this.multicall(selectorArray, chainId, fastCall, 40)

            await sleep(2000)
            await this.getBankItems()
            await this.updateQueuedActions()
        },
        async bridgeHeroes(
            proxys: ProxySilo[],
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const bridgeAddress = coreStore.getAddress(Address.bridge, chainId)
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !bridgeAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const selectorArray = proxys.map((h) =>
                encode(factoryAbi, "execute", [
                    h.address,
                    bridgeAddress,
                    encode(bridgeAbi, "sendPlayer", [
                        BigInt(h.playerId),
                        "",
                        "",
                        "",
                        0,
                        "",
                        "",
                        "",
                    ]),
                ])
            )


            await this.multicall(selectorArray, chainId, false, 1, BigInt(2e17), BigInt(11660000))
            await sleep(2000)
        },
        async executeSavedTransactions(
            proxys: ProxySilo[],
            fastCall: boolean,
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const broochStore = useBroochStore()
            const hasRubyBrooch = broochStore.brooches.some(
                (i) => i.tokenId === 1 && i.balance > 0
            )

            if (hasRubyBrooch) {
                const selectorArray = proxys.map((h) =>
                    encode(factoryAbi, "executeSavedTransactions", [h.address])
                )

                await this.multicall(selectorArray, chainId, fastCall, 10)
            } else {
                // execute one by one
                this.totalTransactionNumber = proxys.length
                try {
                    for (let i = 0; i < proxys.length; i++) {
                        this.currentTransactionNumber = i + 1
                        const hash = await writeContract(config, {
                            address: factoryAddress as `0x${string}`,
                            abi: factoryAbi,
                            functionName: "executeSavedTransactions",
                            args: [proxys[i].address],
                            type: "legacy",
                            value: this.transactionCharge,
                            chainId,
                        })
                        await waitForTransactionReceipt(config, { hash })
                    }
                } catch (e) {
                    throw e
                } finally {
                    this.totalTransactionNumber = 0
                    this.currentTransactionNumber = 0
                }
            }
            await sleep(2000)
            await this.getBankItems()
            await this.updateQueuedActions()
        },
        async updateQueuedActions() {
            const queuedActionResult = await searchQueuedActions(this.proxys.filter(p => p.playerId !== "").map(p => p.playerId))
            for (const proxy of this.proxys) {
                if (
                    proxy.playerId === "" ||
                    proxy.savedTransactions.length === 0
                ) {
                    continue
                }
                proxy.queuedActions =
                    queuedActionResult.queuedActions
                        .filter((x) =>
                            x.playerId === proxy.playerId
                        )
                        .flat() || []
            }
        },
        async withdrawItems(items: any[], chainId: SonicChainId) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT, chainId)
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !itemAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const fromAddress = this.bank?.address
            if (!fromAddress) {
                return
            }

            const selectorArray = [
                encode(factoryAbi, "execute", [
                    fromAddress,
                    itemAddress,
                    encode(itemNFTAbi, "safeBatchTransferFrom", [
                        fromAddress,
                        account.address,
                        items.map((i) => i.tokenId),
                        items.map((i) => BigInt(i.amount)),
                        "0x",
                    ]),
                ]),
            ]

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "multicall",
                args: [selectorArray],
                type: "legacy",
                chainId,
            })
            await waitForTransactionReceipt(config, { hash, chainId })
            await this.getBankItems()
        },
        async getRelevantItemsForProxies(
            proxys: ProxySilo[],
        ) {
            const results: UserItemNFTResult = await getMultiUserItemNFTs(this.proxys.map(p => p.address), [])

            const distinctItems: number[] = []

            for (const result of results.userItemNFTs) {
                if (!distinctItems.includes(result.tokenId)) {
                    distinctItems.push(result.tokenId)
                }
            }

            const relevantTokenIds: number[] = []
            for (const proxy of proxys) {
                const decoded = safeDecode(
                    proxy.savedTransactions[0].data,
                    "startActions"
                )
                const actionId = decoded?.[1]?.[0]?.actionId || BigInt(0)
                const actionChoiceId = decoded?.[1]?.[0]?.choiceId || BigInt(0)
                const action = allActions.find(
                    (a) => a.actionId === Number(actionId)
                )
                const actionChoice = getActionChoiceById(
                    Number(actionId),
                    Number(actionChoiceId)
                )

                if (action) {
                    relevantTokenIds.push(
                        ...action.guaranteedRewards.map((r) => r.itemTokenId)
                    )
                    relevantTokenIds.push(
                        ...action.randomRewards.map((r) => r.itemTokenId)
                    )
                }
                if (actionChoice) {
                    relevantTokenIds.push(actionChoice.outputTokenId)
                    // relevantTokenIds.push(...actionChoice.inputTokenIds)
                }

                for (const q of proxy.queuedActions) {
                    if (q.choice) {
                        relevantTokenIds.push(q.choice.outputTokenId)
                    } else {
                        const action = allActions.find(
                            (a) => a.actionId === q.actionId
                        )
                        if (action) {
                            relevantTokenIds.push(
                                ...action.guaranteedRewards.map(
                                    (r) => r.itemTokenId
                                )
                            )
                            relevantTokenIds.push(
                                ...action.randomRewards.map(
                                    (r) => r.itemTokenId
                                )
                            )
                        }
                    }
                }
            }
            return { relevantTokenIds, distinctItems }
        },
        async transferItemsToBank(
            relevantTokenIds: number[],
            proxys: ProxySilo[],
            chainId: SonicChainId,
            overrideNeedsItem: boolean = false
        ) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT, chainId)
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !itemAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const toAddress = this.bank?.address
            if (!toAddress) {
                return
            }

            const results: UserItemNFTResult = await getMultiUserItemNFTs(proxys.map(p => p.address), [])

            // match proxy on item result user address and work out the outputs from the decoded saved transaction
            const deposits: { items: UserItemNFT[]; proxy: string }[] = []

            for (const proxy of proxys) {
                for (const item of results.userItemNFTs
                    .filter(i => i.user === proxy.address)
                    .filter((i) => relevantTokenIds.includes(i.tokenId))
                    .filter((i) => overrideNeedsItem || !proxyNeedsItem(i, proxy))) {
                    let d = deposits.find((d) => d.proxy === proxy.address)
                    if (!d) {
                        d = {
                            proxy: proxy?.address,
                            items: [],
                        }
                        deposits.push(d)
                    }
                    if (Number(item.amount) > 0) {
                        // multi user item nft could have overlapped token ids if fetched separately
                        if (!d.items.find((it) => it.tokenId === item.tokenId)) {
                            d.items.push(item)
                        }
                    }
                }
            }

            const selectorArray: string[] = []
            for (const d of deposits) {
                if (d.items.length === 0) {
                    continue
                }

                if (d.items.length > 20) {
                    for (let i = 0; i < d.items.length; i += 20) {
                        const chunk = d.items.slice(i, i + 20)
                        selectorArray.push(
                            encode(factoryAbi, "execute", [
                                d.proxy,
                                itemAddress,
                                encode(itemNFTAbi, "safeBatchTransferFrom", [
                                    d.proxy,
                                    toAddress,
                                    chunk.map((it) => it.tokenId),
                                    chunk.map((it) => BigInt(it.amount)),
                                    "0x",
                                ]),
                            ])
                        )
                    }
                } else {
                    selectorArray.push(
                        encode(factoryAbi, "execute", [
                            d.proxy,
                            itemAddress,
                            encode(itemNFTAbi, "safeBatchTransferFrom", [
                                d.proxy,
                                toAddress,
                                d.items.map((it) => it.tokenId),
                                d.items.map((it) => BigInt(it.amount)),
                                "0x",
                            ]),
                        ])
                    )
                }
            }

            if (selectorArray.length > 0) {
                await this.multicall(selectorArray, chainId, false, 40)
            }
            await sleep(2000)
            await this.getBankItems()
        },
        async transferItemsToAddress(
            siloAddress: string,
            toAddress: string,
            items: TransferUserItemNFT[],
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT, chainId)
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !itemAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const data = encode(itemNFTAbi, "safeBatchTransferFrom", [
                siloAddress,
                toAddress,
                items.map((i) => i.tokenId),
                items.map((i) => BigInt(i.transferAmount)),
                "0x",
            ])

            const hash = await writeContract(config, {
                address: factoryAddress as `0x${string}`,
                abi: factoryAbi,
                functionName: "execute",
                args: [siloAddress, itemAddress, data],
                type: "legacy",
                chainId,
            })
            await waitForTransactionReceipt(config, { hash })
            await this.getBankItems()
        },
        async distributeItems(
            items: {
                address: string
                tokenId: number
                amount: string
            }[],
            chainId: SonicChainId
        ) {
            const coreStore = useCoreStore()
            const itemAddress = coreStore.getAddress(Address.itemNFT, chainId)
            const factoryAddress = coreStore.getAddress(
                Address.factoryRegistry,
                chainId
            )
            const account = getAccount(config)
            if (
                !factoryAddress ||
                !itemAddress ||
                !account.isConnected ||
                account.chainId !== chainId
            ) {
                return
            }

            const fromAddress = this.bank?.address

            const selectorArray = items.map((i) =>
                encode(factoryAbi, "execute", [
                    fromAddress,
                    itemAddress,
                    encode(itemNFTAbi, "safeBatchTransferFrom", [
                        fromAddress,
                        i.address,
                        [i.tokenId],
                        [BigInt(i.amount)],
                        "0x",
                    ]),
                ])
            )

            await this.multicall(selectorArray, chainId, false, 40)
            await sleep(2000)
            await this.getBankItems()
        },
        async getBankItems() {
            if (this.bank) {
                const result = await getUserItemNFTs(
                    this.bank.address,
                    [],
                )
                this.bankItems = result.userItemNFTs || []
            }
        },
    },
})
