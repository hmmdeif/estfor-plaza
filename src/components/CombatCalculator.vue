<template>
    <div class="flex my-2 gap-2 md:my-10 md:gap-10">
        <Avatar
            class="flex-initial w-1/3 md:w-1/4 min-w-[200px]"
            :id="coreStore.playerState?.avatarId"
            :name="coreStore.playerState?.name"
        />
        <div
            class="grow 2xl:flex-initial card bg-base-100-50 shadow-xl rounded-lg 2xl:w-[280px]"
        >
            <div class="card-body flex flex-wrap">
                <ItemSelect
                    :items="headItems"
                    label="Head"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.head"
                />
                <ItemSelect
                    :items="neckItems"
                    label="Neck"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.neck"
                />
                <ItemSelect
                    :items="bodyItems"
                    label="Body"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.body"
                />
                <ItemSelect
                    :items="armItems"
                    label="Arms"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.arms"
                />
                <ItemSelect
                    :items="legItems"
                    label="Legs"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.legs"
                />
                <ItemSelect
                    :items="feetItems"
                    label="Feet"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.feet"
                />
                <ItemSelect
                    :items="ringItems"
                    label="Ring"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.ring"
                />
                <ItemSelect
                    :items="rightHandItems"
                    label="Right Hand"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.rightHand"
                    :empty-equipment="false"
                />
                <ItemSelect
                    v-if="isMelee"
                    :items="leftHandItems"
                    label="Left Hand"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.leftHand"
                />
                <ItemSelect
                    v-if="isMagic"
                    :items="magicBagItems"
                    label="Magic Bag"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.magicBag"
                    :empty-equipment="false"
                />
                <ItemSelect
                    v-if="isRanged"
                    :items="quiverItems"
                    label="Quiver"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.quiver"
                    :empty-equipment="false"
                />
                <PetSelect
                    :items="pets"
                    label="Pet"
                    v-model="equippedItems.pet"
                    @update:model-value="onUpdate"
                />
                <ItemSelect
                    :items="foodItems"
                    label="Food"
                    @update:model-value="onUpdate"
                    v-model="equippedItems.food"
                />
                <label class="label w-full cursor-pointer justify-between">
                    <span class="text-xs mr-2 items-center flex">
                        Show Owned Pets Only
                    </span>
                    <input
                        type="checkbox"
                        class="checkbox checkbox-primary"
                        v-model="ownedPetsOnly"
                        @change="onUpdate()"
                    />
                </label>
                <div
                    class="md:flex-row xl:flex-col flex-col flex justify-stretch w-full gap-2"
                >
                    <button
                        class="btn btn-primary grow btn-xs sm:btn-sm md:btn-md xl:btn-sm"
                        @click.prevent="equipFullMelee"
                    >
                        Full Melee
                    </button>
                    <button
                        class="btn btn-primary grow btn-xs sm:btn-sm md:btn-md xl:btn-sm"
                        @click.prevent="equipFullRanged"
                    >
                        Full Ranged
                    </button>
                    <button
                        class="btn btn-primary grow btn-xs sm:btn-sm md:btn-md xl:btn-sm"
                        @click.prevent="equipFullMagic"
                    >
                        Full Magic
                    </button>
                </div>
            </div>
        </div>
        <div
            class="max-xl:hidden my-2 md:my-10 w-1/2 flex flex-col justify-center items-center"
        >
            <HeroStats id="horizontal_hero_stats" />
        </div>
    </div>
    <div class="xl:hidden my-2 md:my-10">
        <HeroStats id="vertical_hero_stats" />
    </div>
    <BoostPanel :hide-non-combat="true" class="my-2 md:my-10" />
    <ItemSearch class="my-2 md:my-10 lg:hidden" />
    <MonsterRankings />
</template>

<script setup lang="ts">
import {
    EquipPosition,
    ItemInput,
    PetEnhancementType,
    Skill,
} from "@paintswap/estfor-definitions/types"
import { useItemStore } from "../store/items"
import Avatar from "./Avatar.vue"
import HeroStats from "./HeroStats.vue"
import BoostPanel from "./BoostPanel.vue"
import ItemSearch from "./ItemSearch.vue"
import ItemSelect from "./inputs/ItemSelect.vue"
import PetSelect from "./inputs/PetSelect.vue"
import { computed, nextTick, ref } from "vue"
import MonsterRankings from "./MonsterRankings.vue"
import { useCoreStore } from "../store/core"

const itemStore = useItemStore()
const coreStore = useCoreStore()
const equippedItems = ref({ ...itemStore.getCurrentEquippedItems })
const ownedPetsOnly = ref(true)

const headItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.HEAD)
)
const neckItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.NECK)
)
const rightHandItems = computed(() => [
    ...itemStore.getItemsForSlotAndXP(EquipPosition.RIGHT_HAND),
    ...itemStore.getItemsForSlotAndXP(EquipPosition.BOTH_HANDS),
])
const leftHandItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.LEFT_HAND)
)
const bodyItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.BODY)
)
const legItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.LEGS)
)
const feetItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.FEET)
)
const armItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.ARMS)
)
const ringItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.RING)
)
const quiverItems = computed(() => itemStore.getRangedActionChoicesForXP)
const magicBagItems = computed(() =>
    itemStore.getMagicActionChoicesForXP(equippedItems.value.rightHand || 0)
)
const foodItems = computed(() =>
    itemStore.getItemsForSlotAndXP(EquipPosition.FOOD)
)
const pets = computed(() =>
    itemStore
        .getOwnedAndBasicPets(ownedPetsOnly.value)
        .filter(
            (x) =>
                (isMelee.value
                    ? x.basePet.enhancementType === PetEnhancementType.MELEE
                    : isRanged.value
                      ? x.basePet.enhancementType === PetEnhancementType.RANGED
                      : isMagic.value
                        ? x.basePet.enhancementType === PetEnhancementType.MAGIC
                        : false) ||
                x.basePet.enhancementType === PetEnhancementType.DEFENCE ||
                x.basePet.enhancementType === PetEnhancementType.HEALTH ||
                x.basePet.enhancementType ===
                    PetEnhancementType.MELEE_AND_DEFENCE ||
                x.basePet.enhancementType ===
                    PetEnhancementType.MAGIC_AND_DEFENCE ||
                x.basePet.enhancementType ===
                    PetEnhancementType.RANGED_AND_DEFENCE
        )
)

const findLast = (arr: any[], criteria: any) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (criteria(arr[i])) {
            return arr[i]
        }
    }
    return null
}

const onUpdate = async () => {
    await nextTick() // wait for the model to update
    if (isRanged.value) {
        // equippedItems.value.quiver = rangedItemToActionChoice(equippedItems.value.rightHand || 0, equippedItems.value.quiver || 0)
        equippedItems.value.magicBag = undefined
        equippedItems.value.leftHand = undefined
    }
    if (isMagic.value) {
        equippedItems.value.quiver = undefined
        equippedItems.value.leftHand = undefined
    }
    if (isMelee.value) {
        equippedItems.value.quiver = undefined
        equippedItems.value.magicBag = undefined
    }
    if (pets.value.length === 0) {
        equippedItems.value.pet = undefined
    }
    itemStore.updateEquippedItems(equippedItems.value as any)
}

const equipFullMelee = () => {
    equippedItems.value.head = findLast(
        headItems.value,
        (x: ItemInput) => x.skill === Skill.DEFENCE
    )?.tokenId
    equippedItems.value.rightHand = findLast(
        rightHandItems.value,
        (x: ItemInput) => x.skill === Skill.MELEE
    )?.tokenId
    equippedItems.value.leftHand = findLast(
        leftHandItems.value,
        (x: ItemInput) => x.skill === Skill.DEFENCE
    )?.tokenId
    equippedItems.value.body = findLast(
        bodyItems.value,
        (x: ItemInput) => x.skill === Skill.DEFENCE
    )?.tokenId
    equippedItems.value.legs = findLast(
        legItems.value,
        (x: ItemInput) => x.skill === Skill.DEFENCE
    )?.tokenId
    equippedItems.value.arms = findLast(
        armItems.value,
        (x: ItemInput) => x.skill === Skill.DEFENCE
    )?.tokenId
    equippedItems.value.feet = findLast(
        feetItems.value,
        (x: ItemInput) => x.skill === Skill.DEFENCE
    )?.tokenId
    onUpdate()
}

const equipFullRanged = () => {
    equippedItems.value.head = findLast(
        headItems.value,
        (x: ItemInput) => x.skill === Skill.RANGED
    )?.tokenId
    equippedItems.value.rightHand = findLast(
        rightHandItems.value,
        (x: ItemInput) => x.skill === Skill.RANGED
    )?.tokenId
    equippedItems.value.body = findLast(
        bodyItems.value,
        (x: ItemInput) => x.skill === Skill.RANGED
    )?.tokenId
    equippedItems.value.legs = findLast(
        legItems.value,
        (x: ItemInput) => x.skill === Skill.RANGED
    )?.tokenId
    equippedItems.value.arms = findLast(
        armItems.value,
        (x: ItemInput) => x.skill === Skill.RANGED
    )?.tokenId
    equippedItems.value.feet = findLast(
        feetItems.value,
        (x: ItemInput) => x.skill === Skill.RANGED
    )?.tokenId
    onUpdate()
}

const equipFullMagic = () => {
    equippedItems.value.head = findLast(
        headItems.value,
        (x: ItemInput) => x.skill === Skill.MAGIC
    )?.tokenId
    equippedItems.value.rightHand = findLast(
        rightHandItems.value,
        (x: ItemInput) => x.skill === Skill.MAGIC
    )?.tokenId
    equippedItems.value.body = findLast(
        bodyItems.value,
        (x: ItemInput) => x.skill === Skill.MAGIC
    )?.tokenId
    equippedItems.value.legs = findLast(
        legItems.value,
        (x: ItemInput) => x.skill === Skill.MAGIC
    )?.tokenId
    equippedItems.value.arms = findLast(
        armItems.value,
        (x: ItemInput) => x.skill === Skill.MAGIC
    )?.tokenId
    equippedItems.value.feet = findLast(
        feetItems.value,
        (x: ItemInput) => x.skill === Skill.MAGIC
    )?.tokenId
    equippedItems.value.magicBag = findLast(
        magicBagItems.value,
        (x: ItemInput) => x.skill === Skill.MAGIC
    )?.tokenId
    onUpdate()
}

const isMelee = computed(() => {
    return rightHandItems.value.find(
        (x) =>
            x.tokenId === equippedItems.value.rightHand &&
            x.skill === Skill.MELEE
    )
})

const isRanged = computed(() => {
    return rightHandItems.value.find(
        (x) =>
            x.tokenId === equippedItems.value.rightHand &&
            x.skill === Skill.RANGED
    )
})

const isMagic = computed(() => {
    return rightHandItems.value.find(
        (x) =>
            x.tokenId === equippedItems.value.rightHand &&
            x.skill === Skill.MAGIC
    )
})
</script>
