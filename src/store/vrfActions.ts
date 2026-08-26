import { allInstantVRFActions } from "../data/instantVRFActions"
import {InstantVRFActionType, InstantVRFActionInput} from "@paintswap/estfor-definitions/types";
import { EstforConstants } from "@paintswap/estfor-definitions";
import { defineStore } from "pinia";

interface VRFActionsState {
    forging: InstantVRFActionInput[],
    generic: InstantVRFActionInput[],
    egg: InstantVRFActionInput[],
}

export const vrfActionNames = {
    [InstantVRFActionType.FORGING]: "Forging",
    [InstantVRFActionType.GENERIC]: "Thieving",
    [InstantVRFActionType.EGG]: "Pets",
    [InstantVRFActionType.NONE]: "None",
}

export const vrfActionIdNames = {
    [EstforConstants.INSTANT_VRF_ACTION_EGG_TIER1]: "Tier 1 Egg",
    [EstforConstants.INSTANT_VRF_ACTION_EGG_TIER2]: "Tier 2 Egg",
    [EstforConstants.INSTANT_VRF_ACTION_EGG_TIER3]: "Tier 3 Egg",
    [EstforConstants.INSTANT_VRF_ACTION_EGG_TIER4]: "Tier 4 Egg",
    [EstforConstants.INSTANT_VRF_ACTION_EGG_TIER5]: "Tier 5 Egg",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_1_TIER1]: "OG Egg Tier 1",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_1_TIER2]: "OG Egg Tier 2",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_1_TIER3]: "OG Egg Tier 3",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_1_TIER4]: "OG Egg Tier 4",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_1_TIER5]: "OG Egg Tier 5",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_2_TIER1]: "1Kin Egg Tier 1",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_2_TIER2]: "1Kin Egg Tier 2",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_2_TIER3]: "1Kin Egg Tier 3",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_2_TIER4]: "1Kin Egg Tier 4",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_2_TIER5]: "1Kin Egg Tier 5",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_3_TIER1]: "Frost Egg Tier 1",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_3_TIER2]: "Frost Egg Tier 2",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_3_TIER3]: "Frost Egg Tier 3",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_3_TIER4]: "Frost Egg Tier 4",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_3_TIER5]: "Frost Egg Tier 5",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_4_TIER1]: "Crystal Egg Tier 1",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_4_TIER2]: "Crystal Egg Tier 2",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_4_TIER3]: "Crystal Egg Tier 3",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_4_TIER4]: "Crystal Egg Tier 4",
    [EstforConstants.INSTANT_VRF_ACTION_SECRET_EGG_4_TIER5]: "Crystal Egg Tier 5",
    [EstforConstants.INSTANT_VRF_ACTION_ANNIV1_EGG_TIER1]: "Anniversary 1 Tier 1",
    [EstforConstants.INSTANT_VRF_ACTION_ANNIV1_EGG_TIER2]: "Anniversary 1 Tier 2",
    [EstforConstants.INSTANT_VRF_ACTION_ANNIV1_EGG_TIER3]: "Anniversary 1 Tier 3",
    [EstforConstants.INSTANT_VRF_ACTION_ANNIV1_EGG_TIER4]: "Anniversary 1 Tier 4",
    [EstforConstants.INSTANT_VRF_ACTION_ANNIV1_EGG_TIER5]: "Anniversary 1 Tier 5",
    [EstforConstants.INSTANT_VRF_ACTION_KRAGSTYR_EGG_TIER1]: "Kragstyr Tier 1",
    [EstforConstants.INSTANT_VRF_ACTION_KRAGSTYR_EGG_TIER2]: "Kragstyr Tier 2",
    [EstforConstants.INSTANT_VRF_ACTION_KRAGSTYR_EGG_TIER3]: "Kragstyr Tier 3",
    [EstforConstants.INSTANT_VRF_ACTION_KRAGSTYR_EGG_TIER4]: "Kragstyr Tier 4",
    [EstforConstants.INSTANT_VRF_ACTION_KRAGSTYR_EGG_TIER5]: "Kragstyr Tier 5",

    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_FISHING_CHEST_1]: "Thieving Fishing Chest 1",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_FISHING_CHEST_2]: "Thieving Fishing Chest 2",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_FISHING_CHEST_3]: "Thieving Fishing Chest 3",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_FISHING_CHEST_4]: "Thieving Fishing Chest 4",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_FISHING_CHEST_5]: "Thieving Fishing Chest 5",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_WOODCUTTING_CHEST_1]: "Thieving Woodcutting Chest 1",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_WOODCUTTING_CHEST_2]: "Thieving Woodcutting Chest 2",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_WOODCUTTING_CHEST_3]: "Thieving Woodcutting Chest 3",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_WOODCUTTING_CHEST_4]: "Thieving Woodcutting Chest 4",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_WOODCUTTING_CHEST_5]: "Thieving Woodcutting Chest 5",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_MINING_CHEST_1]: "Thieving Mining Chest 1",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_MINING_CHEST_2]: "Thieving Mining Chest 2",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_MINING_CHEST_3]: "Thieving Mining Chest 3",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_MINING_CHEST_4]: "Thieving Mining Chest 4",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_MINING_CHEST_5]: "Thieving Mining Chest 5",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_DRAGON_CHEST]: "Thieving Dragon Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_BONE_CHEST]: "Thieving Bone Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_ANNIV1_CHEST]: "Thieving Anniversary 1 Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_TRICK_CHEST]: "Thieving Trick Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_TREAT_CHEST]: "Thieving Treat Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_PRIMORDIAL_CHEST]: "Thieving Primordial Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_AETHER_CHEST]: "Thieving Aether Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_ARCANE_CHEST]: "Thieving Arcane Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_ASTRAL_CHEST]: "Thieving Astral Chest",
    [EstforConstants.INSTANT_VRF_ACTION_THIEVING_VOID_CHEST]: "Thieving Void Chest",

    [EstforConstants.INSTANT_VRF_ACTION_FARMING_WILD_SEED]: "Farming Wild Seed",
    [EstforConstants.INSTANT_VRF_ACTION_FARMING_UNKNOWN_SEED]: "Farming Unknown Seed",
    [EstforConstants.INSTANT_VRF_ACTION_FARMING_MYSTERIOUS_SEED]: "Farming Mysterious Seed",
    [EstforConstants.INSTANT_VRF_ACTION_FARMING_OBSCURE_SEED]: "Farming Obscure Seed",
    [EstforConstants.INSTANT_VRF_ACTION_FARMING_ANCIENT_SEED]: "Farming Ancient Seed",

    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORICHALCUM_HELMET]: "Forging Orichalcum Helmet",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORICHALCUM_ARMOR]: "Forging Orichalcum Armor",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORICHALCUM_TASSETS]: "Forging Orichalcum Tassets",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORICHALCUM_GAUNTLETS]: "Forging Orichalcum Gauntlets",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORICHALCUM_BOOTS]: "Forging Orichalcum Boots",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORICHALCUM_SHIELD]: "Forging Orichalcum Shield",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_DRAGONSTONE_AMULET]: "Forging Dragonstone Amulet",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_MASTER_HAT]: "Forging Master Hat",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_MASTER_BODY]: "Forging Master Body",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_MASTER_TROUSERS]: "Forging Master Trousers",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_MASTER_BRACERS]: "Forging Master Bracers",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_MASTER_BOOTS]: "Forging Master Boots",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORICHALCUM_SWORD]: "Forging Orichalcum Sword",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_DRAGONSTONE_STAFF]: "Forging Dragonstone Staff",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_GODLY_BOW]: "Forging Godly Bow",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_SCORCHING_COWL]: "Forging Scorching Cowl",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_SCORCHING_BODY]: "Forging Scorching Body",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_SCORCHING_CHAPS]: "Forging Scorching Chaps",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_SCORCHING_BRACERS]: "Forging Scorching Bracers",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_SCORCHING_BOOTS]: "Forging Scorching Boots",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ORCALITH_CLEDYR]: "Forging Orcalith Cledyr",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_DEUION_KIEL]: "Forging Deuion Kiel",
    [EstforConstants.INSTANT_VRF_ACTION_FORGING_ODLARIONS_WYSGRIF]: "Forging Odlarions Wysgrif",
}

export const useVRFActionsStore = defineStore("vrfActions", {
    state: () => ({
        forging: allInstantVRFActions.filter(x => x.actionType === InstantVRFActionType.FORGING),
        generic: allInstantVRFActions.filter(x => x.actionType === InstantVRFActionType.GENERIC),
        egg: allInstantVRFActions.filter(x => x.actionType === InstantVRFActionType.EGG),        
    }) as VRFActionsState,
    getters: {
        getActionsForActionType: (state: VRFActionsState) => {
            return (actionType: InstantVRFActionType): InstantVRFActionInput[] => {
                switch (actionType) {
                    case InstantVRFActionType.FORGING:
                        return state.forging
                    case InstantVRFActionType.GENERIC:
                        return state.generic
                    case InstantVRFActionType.EGG:
                        return state.egg
                    default:
                        return []
                }
            }
        }
    }
})
