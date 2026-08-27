<template>
    <dialog :id="props.id" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                Assign {{ heroesToAssign.length }} Hero{{
                    heroesToAssign.length === 1 ? "" : "es"
                }}
            </h3>

            <SkillSelect
                class="mt-5"
                v-model="skillId"
                @update:model-value="actionId = 0;actionChoiceOutputId = 0;missingItems = []"
            />
            <ActionInputSelect
                v-if="
                    skillId > 0 &&
                    skillStore.getActionInputsForSkill(skillId).length > 0
                "
                class="mt-5"
                v-model="actionId"
                :skill-id="skillId"
                :heroes="heroesToAssign"
                @update:model-value="actionChoiceOutputId = 0"
            />
            <ActionChoiceInputSelect
                v-if="
                    skillId > 0 &&
                    skillStore.getActionChoiceInputsForSkill(skillId).length > 0
                "
                class="mt-5"
                v-model="actionChoiceOutputId"
                :skill-id="skillId"
                :heroes="heroesToAssign"
                @update:model-value="actionId = 0"
            />

            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="headItems"
                label="Head"
                @update:model-value="onUpdate"
                v-model="equippedItems.head"
                class="mt-5"
                custom-class="select-md"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="neckItems"
                label="Neck"
                @update:model-value="onUpdate"
                v-model="equippedItems.neck"
                class="mt-5"
                custom-class="select-md"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="bodyItems"
                label="Body"
                @update:model-value="onUpdate"
                v-model="equippedItems.body"
                class="mt-5"
                custom-class="select-md"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="armItems"
                label="Arms"
                @update:model-value="onUpdate"
                v-model="equippedItems.arms"
                class="mt-5"
                custom-class="select-md"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="legItems"
                label="Legs"
                @update:model-value="onUpdate"
                v-model="equippedItems.legs"
                class="mt-5"
                custom-class="select-md"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="feetItems"
                label="Feet"
                @update:model-value="onUpdate"
                v-model="equippedItems.feet"
                class="mt-5"
                custom-class="select-md"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="ringItems"
                label="Ring"
                @update:model-value="onUpdate"
                v-model="equippedItems.ring"
                class="mt-5"
                custom-class="select-md"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="combatRightHandItems"
                class="mt-5"
                custom-class="select-md"
                label="Right Hand"
                @update:model-value="onUpdate"
                v-model="equippedItems.rightHand"
                :empty-equipment="false"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT && isMelee"
                :items="leftHandItems"
                class="mt-5"
                custom-class="select-md"
                label="Left Hand"
                @update:model-value="onUpdate"
                v-model="equippedItems.leftHand"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT && isMagic"
                :items="magicBagItems"
                class="mt-5"
                custom-class="select-md"
                label="Magic Bag"
                @update:model-value="onUpdate"
                v-model="equippedItems.magicBag"
                :empty-equipment="false"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT && isRanged"
                :items="quiverItems"
                class="mt-5"
                custom-class="select-md"
                label="Quiver"
                @update:model-value="onUpdate"
                v-model="equippedItems.quiver"
                :empty-equipment="false"
            />
            <ItemSelect
                v-if="skillId === Skill.COMBAT"
                :items="foodItems"
                class="mt-5"
                custom-class="select-md"
                label="Food"
                @update:model-value="onUpdate"
                v-model="equippedItems.food"
            />
            <CombatStyleSelect
                v-if="skillId === Skill.COMBAT"
                class="mt-5"
                custom-class="select-md"
                :skill="
                    isMelee
                        ? Skill.MELEE
                        : isRanged
                          ? Skill.RANGED
                          : isMagic
                            ? Skill.MAGIC
                            : Skill.NONE
                "
                v-model="combatStyle"
            />

            <ActionQueueStatusSelect class="mt-5" v-model="queueStatus" />

            <label class="label w-full cursor-pointer justify-between mt-5">
                <span class="text-xs mr-2 items-center flex">
                    Set Active
                    <div
                        class="tooltip tooltip-primary tooltip-right ml-2"
                        data-tip="Active silos allows anyone to execute the assigned actions. Paused silos will not execute any actions."
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="w-5 h-5"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                            />
                        </svg>
                    </div>
                </span>
                <input
                    type="checkbox"
                    class="checkbox checkbox-primary"
                    v-model="active"
                />
            </label>
            <label class="label w-full cursor-pointer justify-between">
                <span class="text-xs mr-2 items-center flex">
                    Check Heroes Have Items
                </span>
                <input
                    type="checkbox"
                    class="checkbox checkbox-primary"
                    v-model="checkItems"
                    @change="missingItems = []"
                />
            </label>
            <ItemSelect
                v-if="
                    !checkItems &&
                    skillId !== Skill.COMBAT &&
                    rightHandOptions.length > 0
                "
                :items="rightHandOptions"
                class="mt-5"
                custom-class="select-md"
                label="Tool"
                v-model="manualRightHand"
                :empty-equipment="false"
            />
            <div v-if="missingItems.length > 0" class="mt-5">
                <div
                    v-for="item in missingItems"
                    :key="item"
                    class="text-error text-sm"
                >
                    {{ item }}
                </div>
            </div>
            <div v-if="checking" class="flex justify-between items-center mt-5">
                <span
                    >Checking all heroes have the correct items for
                    action...</span
                >
                <span class="loading loading-spinner loading-md mx-auto"></span>
            </div>
            <button
                type="button"
                class="btn btn-primary mt-5 w-full"
                @click="assignHeroes"
                :disabled="
                    loading || (actionId === 0 && actionChoiceOutputId === 0)
                "
            >
                Assign {{ heroesToAssign.length }} Hero{{
                    heroesToAssign.length === 1 ? "" : "es"
                }}
                to {{ skillNames[skillId] || "" }}
                {{ actionNames[actionId] || "" }}
            </button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue"
import { actionNames, skillNames, useSkillStore } from "../../store/skills"
import {
    getItemName,
    rangedItemToActionChoice,
    useItemStore,
} from "../../store/items"
import { allActions } from "../../data/actions"
import {
    ActionQueueStrategy,
    CombatStyle,
    EquipPosition,
    Skill,
} from "@paintswap/estfor-definitions/types"
import {
    calculateExtraXPForHeroActionInput,
    getItemsForSlotAndHeroes,
    getMagicActionChoicesForHeroes,
    getRangedActionChoicesForHeroes,
    useFactoryStore,
} from "../../store/factory"
import SkillSelect from "../inputs/SkillSelect.vue"
import ActionInputSelect from "../inputs/ActionInputSelect.vue"
import ActionChoiceInputSelect from "../inputs/ActionChoiceInputSelect.vue"
import { getUserItemNFTs } from "../../utils/api"
import { useAppStore } from "../../store/app"
import ActionQueueStatusSelect from "../inputs/ActionQueueStatusSelect.vue"
import { allItems } from "../../data/items"
import { skillToXPMap } from "../../store/core"
import CombatStyleSelect from "../inputs/CombatStyleSelect.vue"
import ItemSelect from "../inputs/ItemSelect.vue"
import { EstforConstants } from "@paintswap/estfor-definitions"
import { ProxySilo } from "../../store/models/factory.models"
import type { SonicChainId } from "../../config"
import { allActionChoicesMagic } from "../../data/actionChoices"
import { allActionChoiceIdsMagic } from "../../data/actionChoiceIds"

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    chainId: {
        type: Number,
        required: true,
    },
})

const skillId = ref(Skill.NONE)
const queueStatus = ref(ActionQueueStrategy.KEEP_LAST_IN_PROGRESS)
const actionId = ref(0)
const actionChoiceOutputId = ref(0)
const skillStore = useSkillStore()
const factoryStore = useFactoryStore()
const itemStore = useItemStore()
const app = useAppStore()

const loading = ref(false)
const checking = ref(false)
const active = ref(true)
const heroesToAssign = ref<ProxySilo[]>([])
const missingItems = ref<string[]>([])
const rightHandItems = ref<number[]>([])
const combatStyle = ref(Skill.NONE)
const equippedItems = ref({
    head: undefined,
    body: undefined,
    arms: undefined,
    legs: undefined,
    feet: undefined,
    neck: undefined,
    rightHand: undefined,
    leftHand: undefined,
    magicBag: undefined,
    food: undefined,
    quiver: undefined,
    ring: undefined,
})
const checkItems = ref(true)
const manualRightHand = ref(undefined)

const openDialog = (heroes: ProxySilo[]) => {
    heroesToAssign.value = heroes
    missingItems.value = []
    rightHandItems.value = []
    combatStyle.value = Skill.NONE
    manualRightHand.value = undefined
    equippedItems.value = {
        head: undefined,
        body: undefined,
        arms: undefined,
        legs: undefined,
        feet: undefined,
        neck: undefined,
        rightHand: undefined,
        leftHand: undefined,
        magicBag: undefined,
        food: undefined,
        quiver: undefined,
        ring: undefined,
    }
    checkItems.value = true
    const dialog = document.getElementById(props.id) as HTMLDialogElement
    dialog.showModal()
}

const combatRightHandItems = computed(() => [
    ...getItemsForSlotAndHeroes(
        EquipPosition.RIGHT_HAND,
        heroesToAssign.value
    ),
    ...getItemsForSlotAndHeroes(
        EquipPosition.BOTH_HANDS,
        heroesToAssign.value
    ),
])
const headItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.HEAD, heroesToAssign.value)
)
const neckItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.NECK, heroesToAssign.value)
)
const leftHandItems = computed(() =>
    getItemsForSlotAndHeroes(
        EquipPosition.LEFT_HAND,
        heroesToAssign.value
    )
)
const bodyItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.BODY, heroesToAssign.value)
)
const legItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.LEGS, heroesToAssign.value)
)
const feetItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.FEET, heroesToAssign.value)
)
const armItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.ARMS, heroesToAssign.value)
)
const ringItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.RING, heroesToAssign.value)
)
const quiverItems = computed(() =>
    getRangedActionChoicesForHeroes(heroesToAssign.value)
)
const magicBagItems = computed(() =>
    getMagicActionChoicesForHeroes(heroesToAssign.value, equippedItems.value.rightHand || 0)
)
const foodItems = computed(() =>
    getItemsForSlotAndHeroes(EquipPosition.FOOD, heroesToAssign.value)
)
const rightHandOptions = computed(() => {
    if (
        skillId.value > 0 &&
        skillStore.getActionInputsForSkill(skillId.value).length > 0
    ) {
        if (actionId.value > 0 && skillId.value !== Skill.COMBAT) {
            const action = allActions.find((x) => x.actionId == actionId.value)
            const max = action?.info.handItemTokenIdRangeMax
            const min = action?.info.handItemTokenIdRangeMin

            // get an array of numbers between min and max (inclusive)
            const requiredItems = Array.from(
                { length: max - min + 1 },
                (_, i) => i + min
            )
            return itemStore.items.filter((x) =>
                requiredItems.includes(x.tokenId)
            )
        }
    } else if (
        skillId.value > 0 &&
        skillStore.getActionChoiceInputsForSkill(skillId.value).length > 0
    ) {
        if (actionChoiceOutputId.value > 0) {
            const action = allActions.find((x) => x.info.skill == skillId.value) // only 1 for action choice
            const max = action?.info.handItemTokenIdRangeMax
            const min = action?.info.handItemTokenIdRangeMin

            // get an array of numbers between min and max (inclusive)
            const requiredItems = Array.from(
                { length: max - min + 1 },
                (_, i) => i + min
            )
            return itemStore.items.filter((x) =>
                requiredItems.includes(x.tokenId)
            )
        }
    }
    return []
})

const isMelee = computed(() => {
    return combatRightHandItems.value.find(
        (x) =>
            x.tokenId === equippedItems.value.rightHand &&
            x.skill === Skill.MELEE
    )
})

const isRanged = computed(() => {
    return combatRightHandItems.value.find(
        (x) =>
            x.tokenId === equippedItems.value.rightHand &&
            x.skill === Skill.RANGED
    )
})

const isMagic = computed(() => {
    return combatRightHandItems.value.find(
        (x) =>
            x.tokenId === equippedItems.value.rightHand &&
            x.skill === Skill.MAGIC
    )
})

const onUpdate = async () => {
    await nextTick() // wait for the model to update
    if (isRanged.value) {
        equippedItems.value.magicBag = undefined
        equippedItems.value.leftHand = undefined
        if (combatStyle.value !== Skill.DEFENCE) {
            combatStyle.value = Skill.RANGED
        }
    }
    if (isMagic.value) {
        equippedItems.value.quiver = undefined
        equippedItems.value.leftHand = undefined
        if (combatStyle.value !== Skill.DEFENCE) {
            combatStyle.value = Skill.MAGIC
        }
    }
    if (isMelee.value) {
        equippedItems.value.quiver = undefined
        equippedItems.value.magicBag = undefined
        if (combatStyle.value !== Skill.DEFENCE) {
            combatStyle.value = Skill.MELEE
        }
    }
}

const checkRequiredItems = async () => {
    rightHandItems.value = []
    checking.value = true
    try {
        if (actionId.value > 0) {
            const action = allActions.find((x) => x.actionId == actionId.value)
            const max = action?.info.handItemTokenIdRangeMax
            const min = action?.info.handItemTokenIdRangeMin

            // get an array of numbers between min and max (inclusive)
            const requiredItems = Array.from(
                { length: max - min + 1 },
                (_, i) => i + min
            )

            if (requiredItems.some((x) => x > 0)) {
                for (const h of heroesToAssign.value) {
                    const userItemsResult = await getUserItemNFTs(
                        h.address,
                        [],
                    )
                    // filter out user items that are below minXP
                    const { extraXP } = calculateExtraXPForHeroActionInput(
                        h,
                        skillId.value
                    )
                    const filteredItems = userItemsResult.userItemNFTs.filter(
                        (x) => {
                            return (
                                allItems.find((y) => y.tokenId == x.tokenId)
                                    ?.minXP <=
                                // @ts-ignore
                                Number(h.playerState[skillToXPMap[x.item.skill]]) +
                                    extraXP
                            )
                        }
                    )

                    if (
                        !filteredItems.some((x) =>
                            requiredItems.includes(x.tokenId)
                        )
                    ) {
                        missingItems.value.push(
                            `${h.playerState.name} is missing ${getItemName(
                                min
                            )}`
                        )
                    } else if (allItems.find((x) => x.tokenId === min)?.isFullModeOnly && !h.playerState.isFullMode) {
                        missingItems.value.push(
                            `${h.playerState.name} is trying to use ${getItemName(
                                min
                            )} but is not evolved`
                        )
                    }

                    // find first item in the requiredItems array that the user has
                    rightHandItems.value.push(
                        filteredItems.find((x) =>
                            requiredItems.includes(x.tokenId)
                        )?.tokenId || 0
                    )
                }
            }
        }
    } catch {
    } finally {
        checking.value = false
    }
}

const checkCombatItems = async () => {
    checking.value = true
    try {
        if (actionId.value > 0) {
            const requiredItems = [
                equippedItems.value.head,
                equippedItems.value.neck,
                equippedItems.value.body,
                equippedItems.value.arms,
                equippedItems.value.legs,
                equippedItems.value.feet,
                equippedItems.value.rightHand,
                equippedItems.value.leftHand,
                equippedItems.value.ring,
            ].filter((x) => x !== undefined)

            for (const h of heroesToAssign.value) {
                const userItemsResult = await getUserItemNFTs(
                    h.address,
                    [],
                )
                // filter out user items that are below minXP
                const { meleeXP, magicXP, rangedXP, defenceXP } =
                    calculateExtraXPForHeroActionInput(h, skillId.value)

                const filteredItems = userItemsResult.userItemNFTs.filter(
                    (x) => {
                        return (
                            allItems.find((y) => y.tokenId == x.tokenId)
                                ?.minXP <=
                            // @ts-ignore
                            Number(h.playerState[skillToXPMap[x.item.skill]] || 0) +
                                (x.item.skill === Skill.MELEE
                                    ? meleeXP
                                    : x.item.skill === Skill.MAGIC
                                      ? magicXP
                                      : x.item.skill === Skill.RANGED
                                        ? rangedXP
                                        : x.item.skill === Skill.DEFENCE
                                          ? defenceXP
                                          : 0)
                        )
                    }
                )

                for (const item of requiredItems) {
                    if (item) {
                        if (!filteredItems.some((x) => x.tokenId === item)) {
                            missingItems.value.push(
                                `${h.playerState.name} is missing ${getItemName(
                                    item
                                )}`
                            )
                        } else if (allItems.find((x) => x.tokenId === item)?.isFullModeOnly && !h.playerState.isFullMode) {
                            missingItems.value.push(
                                `${h.playerState.name} is trying to use ${getItemName(
                                    item
                                )} but is not evolved`
                            )
                        }
                    }
                }
            }
        }
    } catch {
    } finally {
        checking.value = false
    }
}

const checkActionChoiceRequiredItems = async () => {
    rightHandItems.value = []
    checking.value = true
    try {
        if (actionChoiceOutputId.value > 0) {
            const action = allActions.find((x) => x.info.skill == skillId.value) // only 1 for action choice
            const max = action?.info.handItemTokenIdRangeMax
            const min = action?.info.handItemTokenIdRangeMin

            // get an array of numbers between min and max (inclusive)
            const requiredItems = Array.from(
                { length: max - min + 1 },
                (_, i) => i + min
            )

            if (requiredItems.some((x) => x > 0)) {
                for (const h of heroesToAssign.value) {
                    const userItemsResult = await getUserItemNFTs(
                        h.address,
                        [],
                    )
                    // filter out user items that are below minXP
                    const { extraXP } = calculateExtraXPForHeroActionInput(
                        h,
                        skillId.value
                    )
                    const filteredItems = userItemsResult.userItemNFTs.filter(
                        (x) => {
                            return (
                                allItems.find((y) => y.tokenId == x.tokenId)
                                    ?.minXP <=
                                // @ts-ignore
                                Number(h.playerState[skillToXPMap[x.item.skill]]) +
                                    extraXP
                            )
                        }
                    )
                    if (
                        !filteredItems.some((x) =>
                            requiredItems.includes(x.tokenId)
                        )
                    ) {
                        missingItems.value.push(
                            `${h.playerState.name} is missing ${getItemName(
                                min
                            )} (${h.address})`
                        )
                    } else if (allItems.find((x) => x.tokenId === min)?.isFullModeOnly && !h.playerState.isFullMode) {
                        missingItems.value.push(
                            `${h.playerState.name} is trying to use ${getItemName(
                                min
                            )} but is not evolved`
                        )
                    }
                    // find first item in the requiredItems array that the user has
                    rightHandItems.value.push(
                        filteredItems.find((x) =>
                            requiredItems.includes(x.tokenId)
                        )?.tokenId || 0
                    )
                }
            }
        }
    } catch {
    } finally {
        checking.value = false
    }
}

const checkEvolvedStatusForAction = async (heroes: ProxySilo[], actionId: number) => {
    let success = true
    const action = allActions.find((x) => x.actionId == actionId)
    if (action?.info.isFullModeOnly && !heroes.some((h) => h.playerState.isFullMode)) {
        missingItems.value.push("Only evolved heroes are allowed to do this action")
        success = false
    }
    return success
}

const checkEvolvedStatusForActionChoice = async (heroes: ProxySilo[], actionChoiceOutputId: number) => {
    let success = true
    const actionChoiceId = skillStore.getActionChoiceInputsForSkill(skillId.value).findIndex((x) => x == actionChoiceOutputId)
    const actionChoice = skillStore.getActionChoicesForSkill(skillId.value)[actionChoiceId]
    if (actionChoice && actionChoice.isFullModeOnly && !heroes.some((h) => h.playerState.isFullMode)) {
        missingItems.value.push("Only evolved heroes are allowed to do this action")
        success = false
    }
    return success
}

const assignHeroes = async () => {
    loading.value = true
    missingItems.value = []
    rightHandItems.value = []
    try {
        if (
            skillId.value > 0 &&
            skillStore.getActionInputsForSkill(skillId.value).length > 0
        ) {
            if (skillId.value === Skill.COMBAT) {
                if (equippedItems.value.rightHand === undefined) {
                    missingItems.value.push("Right Hand is required")
                    return
                }
                if (
                    isMagic.value &&
                    equippedItems.value.magicBag === undefined
                ) {
                    missingItems.value.push("Magic Bag is required")
                    return
                }
            }
            if (checkItems.value) {
                if (skillId.value === Skill.COMBAT) {
                    await checkCombatItems()
                } else {
                    await checkRequiredItems()
                }
                if (missingItems.value.length > 0) {
                    return
                }
            } else if (skillId.value !== Skill.COMBAT) {
                if (
                    !manualRightHand.value &&
                    rightHandOptions.value.length > 0
                ) {
                    missingItems.value.push("Tool is required")
                    return
                }
                if (manualRightHand.value) {
                    rightHandItems.value.push(manualRightHand.value)
                } else {
                    rightHandItems.value.push(0)
                }
            }
            if (!await checkEvolvedStatusForAction(heroesToAssign.value, actionId.value)) {
                return
            }
            console.log(allActionChoiceIdsMagic[
                allActionChoicesMagic.findIndex(
                    (x) =>
                        x.skillDiffs[x.skills.findIndex((d) => d === Skill.MAGIC)] === equippedItems.value.magicBag
                )
            ])
            await factoryStore.assignActionToProxy(
                heroesToAssign.value,
                actionId.value,
                skillId.value === Skill.COMBAT
                    ? isMelee.value
                        ? EstforConstants.ACTIONCHOICE_MELEE_MONSTER
                        : isRanged.value
                          ? rangedItemToActionChoice(
                                equippedItems.value.rightHand || 0,
                                equippedItems.value.quiver || 0
                            )
                          : allActionChoiceIdsMagic[
                                allActionChoicesMagic.findIndex(
                                    (x) =>
                                        x.skillDiffs[x.skills.findIndex((d) => d === Skill.MAGIC)] === equippedItems.value.magicBag
                                )
                            ] || 0
                    : 0,
                equippedItems.value.head,
                equippedItems.value.neck,
                equippedItems.value.body,
                equippedItems.value.arms,
                equippedItems.value.legs,
                equippedItems.value.feet,
                equippedItems.value.ring,
                skillId.value === Skill.COMBAT
                    ? equippedItems.value.rightHand
                    : rightHandItems.value[0],
                equippedItems.value.leftHand,
                equippedItems.value.food,
                skillId.value === Skill.COMBAT
                    ? combatStyle.value === Skill.DEFENCE
                        ? CombatStyle.DEFENCE
                        : CombatStyle.ATTACK
                    : CombatStyle.NONE,
                queueStatus.value,
                active.value,
                props.chainId as SonicChainId
            )
        } else if (
            skillId.value > 0 &&
            skillStore.getActionChoiceInputsForSkill(skillId.value).length > 0
        ) {
            if (checkItems.value) {
                await checkActionChoiceRequiredItems()
                if (missingItems.value.length > 0) {
                    return
                }
            } else {
                if (
                    !manualRightHand.value &&
                    rightHandOptions.value.length > 0
                ) {
                    missingItems.value.push("Tool is required")
                    return
                }
                if (manualRightHand.value) {
                    rightHandItems.value.push(manualRightHand.value)
                } else {
                    rightHandItems.value.push(0)
                }
            }
            if (!await checkEvolvedStatusForActionChoice(heroesToAssign.value, actionChoiceOutputId.value)) {
                return
            }
            await factoryStore.assignActionToProxy(
                heroesToAssign.value,
                allActions.find((x) => x.info.skill == skillId.value)
                    ?.actionId || 0,
                actionChoiceOutputId.value,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                rightHandItems.value[0],
                0,
                0,
                CombatStyle.NONE,
                queueStatus.value,
                active.value,
                props.chainId as SonicChainId
            )
        }

        app.addToast(
            `${heroesToAssign.value.length} hero${
                heroesToAssign.value.length !== 1 ? "es" : ""
            } assigned`,
            "alert-success",
            5000
        )
        skillId.value = Skill.NONE
        const dialog = document.getElementById(props.id) as HTMLDialogElement
        dialog.close()
    } catch {
        // console.error(e)
        // user declined tx
    } finally {
        loading.value = false
    }
}

defineExpose({
    openDialog,
})
</script>
