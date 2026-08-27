import {
    ActionChoiceInput,
    ActionInput,
    Skill,
} from "@paintswap/estfor-definitions/types"
import { defineStore } from "pinia"

import { allActions } from "../data/actions"
import { useCoreStore } from "./core"
import { EstforConstants } from "@paintswap/estfor-definitions"
import {
    allActionChoicesAlchemy,
    allActionChoicesCooking,
    allActionChoicesCrafting,
    allActionChoicesFarming,
    allActionChoicesFiremaking,
    allActionChoicesFletching,
    allActionChoicesForging,
    allActionChoicesMagic,
    allActionChoicesMelee,
    allActionChoicesRanged,
    allActionChoicesSmithing,
} from "../data/actionChoices"
import { getItemName } from "./items"
import { useSearchStore } from "./search"
import {
    allActionChoiceIdsAlchemy,
    allActionChoiceIdsCooking,
    allActionChoiceIdsCrafting,
    allActionChoiceIdsFiremaking,
    allActionChoiceIdsFletching,
    allActionChoiceIdsForging,
    allActionChoiceIdsMagic,
    allActionChoiceIdsMelee,
    allActionChoiceIdsRanged,
    allActionChoiceIdsSmithing,
    allActionChoiceIdsFarming,
} from "../data/actionChoiceIds"

export interface SkillState {
    woodcutting: ActionInput[]
    mining: ActionInput[]
    fishing: ActionInput[]
    cooking: ActionChoiceInput[]
    crafting: ActionChoiceInput[]
    smithing: ActionChoiceInput[]
    firemaking: ActionChoiceInput[]
    alchemy: ActionChoiceInput[]
    forging: ActionChoiceInput[]
    fletching: ActionChoiceInput[]
    thieving: ActionInput[]
    combat: ActionInput[]
    farming: (ActionInput | ActionChoiceInput)[]
}

export const skillNames = {
    [Skill.WOODCUTTING]: "Woodcutting",
    [Skill.MINING]: "Mining",
    [Skill.FISHING]: "Fishing",
    [Skill.COOKING]: "Cooking",
    [Skill.CRAFTING]: "Crafting",
    [Skill.SMITHING]: "Smithing",
    [Skill.FIREMAKING]: "Firemaking",
    [Skill.ALCHEMY]: "Alchemy",
    [Skill.FORGING]: "Forging",
    [Skill.FLETCHING]: "Fletching",
    [Skill.THIEVING]: "Thieving",
    [Skill.NONE]: "None",
    [Skill.COMBAT]: "Combat",
    [Skill.DEFENCE]: "Defence",
    [Skill.MELEE]: "Melee",
    [Skill.MAGIC]: "Magic",
    [Skill.RANGED]: "Ranged",
    [Skill.HEALTH]: "Health",
    [Skill.AGILITY]: "Agility",
    [Skill.HUNTING]: "Hunting",
    [Skill.TRAVELING]: "Traveling",
    [Skill.RESERVED_COMBAT]: "Reserved Combat",
    [Skill.FARMING]: "Farming",
    [Skill.RESERVED4]: "Reserved 4",
    [Skill.RESERVED5]: "Reserved 5",
    [Skill.RESERVED6]: "Reserved 6",
    [Skill.RESERVED7]: "Reserved 7",
    [Skill.RESERVED8]: "Reserved 8",
    [Skill.RESERVED9]: "Reserved 9",
    [Skill.RESERVED10]: "Reserved 10",
    [Skill.RESERVED11]: "Reserved 11",
    [Skill.RESERVED12]: "Reserved 12",
    [Skill.RESERVED13]: "Reserved 13",
    [Skill.RESERVED14]: "Reserved 14",
    [Skill.RESERVED15]: "Reserved 15",
    [Skill.RESERVED16]: "Reserved 16",
    [Skill.RESERVED17]: "Reserved 17",
    [Skill.RESERVED18]: "Reserved 18",
    [Skill.RESERVED19]: "Reserved 19",
    [Skill.RESERVED20]: "Reserved 20",
    [Skill.INCUBATION]: "Incubation",
}

export const actionNames = {
    // taken from the actionId in allActions from  ../data/actions.ts
    [EstforConstants.ACTION_WOODCUTTING_LOG]: "Log",
    [EstforConstants.ACTION_WOODCUTTING_OAK]: "Oak",
    [EstforConstants.ACTION_WOODCUTTING_WILLOW]: "Willow",
    [EstforConstants.ACTION_WOODCUTTING_MAPLE]: "Maple",
    [EstforConstants.ACTION_WOODCUTTING_REDWOOD]: "Redwood",
    [EstforConstants.ACTION_WOODCUTTING_MAGICAL]: "Magical",
    [EstforConstants.ACTION_WOODCUTTING_ASH]: "Ash",
    [EstforConstants.ACTION_WOODCUTTING_ENCHANTED]: "Enchanted",
    [EstforConstants.ACTION_WOODCUTTING_LIVING]: "Living",
    [EstforConstants.ACTION_WOODCUTTING_SECLUDED_FOREST]: "Secluded Forest",
    [EstforConstants.ACTION_WOODCUTTING_CURSED_MOUNTAIN]: "Cursed Mountain",
    [EstforConstants.ACTION_WOODCUTTING_ENCHANTED_GROVE]: "Enchanted Grove",
    [EstforConstants.ACTION_WOODCUTTING_THE_WOODLANDS]: "The Woodlands",
    [EstforConstants.ACTION_WOODCUTTING_WHISPERING_WOODS]: "Whispering Woods",
    [EstforConstants.ACTION_WOODCUTTING_BRAMBLED_THROAT]: "Brambled Throat",
    [EstforConstants.ACTION_WOODCUTTING_CHOKING_HOLLOW]: "Choking Hollow",
    [EstforConstants.ACTION_WOODCUTTING_RAZORVINE_THICKET]: "Razorvine Thicket",
    [EstforConstants.ACTION_WOODCUTTING_THE_HEART]: "The Heart",
    [EstforConstants.ACTION_WOODCUTTING_TANGLED_PASS]: "Tangled Pass",

    [EstforConstants.ACTION_MINING_COPPER]: "Copper",
    [EstforConstants.ACTION_MINING_TIN]: "Tin",
    [EstforConstants.ACTION_MINING_IRON]: "Iron",
    [EstforConstants.ACTION_MINING_COAL]: "Coal",
    [EstforConstants.ACTION_MINING_SAPPHIRE]: "Sapphire",
    [EstforConstants.ACTION_MINING_EMERALD]: "Emerald",
    [EstforConstants.ACTION_MINING_RUBY]: "Ruby",
    [EstforConstants.ACTION_MINING_DIAMOND]: "Diamond",
    [EstforConstants.ACTION_MINING_AMETHYST]: "Amethyst",
    [EstforConstants.ACTION_MINING_DRAGONSTONE]: "Dragonstone",
    [EstforConstants.ACTION_MINING_MITHRIL]: "Mithril",
    [EstforConstants.ACTION_MINING_ADAMANTINE]: "Adamantine",
    [EstforConstants.ACTION_MINING_RUNITE]: "Runite",
    [EstforConstants.ACTION_MINING_TITANIUM]: "Titanium",
    [EstforConstants.ACTION_MINING_ORICHALCUM]: "Orichalcum",
    [EstforConstants.ACTION_MINING_GILDED_HALLS]: "Gilded Halls",
    [EstforConstants.ACTION_MINING_PETRIFIED_GARDEN]: "Petrified Garden",
    [EstforConstants.ACTION_MINING_THRONE_ROOM]: "Throne Room",
    [EstforConstants.ACTION_MINING_GATE]: "Gate",
    [EstforConstants.ACTION_MINING_BURIED_COURTYARD]: "Buried Courtyard",

    [EstforConstants.ACTION_FISHING_MINNUS]: "Minnus",
    [EstforConstants.ACTION_FISHING_BLEKK]: "Blekk",
    [EstforConstants.ACTION_FISHING_SKRIMP]: "Skrimp",
    [EstforConstants.ACTION_FISHING_FEOLA]: "Feola",
    [EstforConstants.ACTION_FISHING_ANCHO]: "Ancho",
    [EstforConstants.ACTION_FISHING_TROUT]: "Trout",
    [EstforConstants.ACTION_FISHING_ROJJA]: "Rojja",
    [EstforConstants.ACTION_FISHING_BOWFISH]: "Bowfish",
    [EstforConstants.ACTION_FISHING_GOLDFISH]: "Goldfish",
    [EstforConstants.ACTION_FISHING_MYSTY_BLUE]: "Mysty Blue",
    [EstforConstants.ACTION_FISHING_FLITFISH]: "Flitfish",
    [EstforConstants.ACTION_FISHING_RAZORFISH]: "Razorfish",
    [EstforConstants.ACTION_FISHING_QUAFFER]: "Quaffer",
    [EstforConstants.ACTION_FISHING_ROXA]: "Roxa",
    [EstforConstants.ACTION_FISHING_AZACUDDA]: "Azacudda",
    [EstforConstants.ACTION_FISHING_STONECLAW]: "Stoneclaw",
    [EstforConstants.ACTION_FISHING_CRUSKAN]: "Cruskan",
    [EstforConstants.ACTION_FISHING_CHODFISH]: "Chodfish",
    [EstforConstants.ACTION_FISHING_DOUBTFISH]: "Doubtfish",
    [EstforConstants.ACTION_FISHING_ROSEFIN]: "Rosefin",
    [EstforConstants.ACTION_FISHING_HIDDEN_POND]: "Hidden Pond",
    [EstforConstants.ACTION_FISHING_ENCHANTED_LAGOON]: "Enchanted Lagoon",
    [EstforConstants.ACTION_FISHING_SECRET_LAKE]: "Secret Lake",
    [EstforConstants.ACTION_FISHING_UNDERGROUND_RIVER]: "Underground River",
    [EstforConstants.ACTION_FISHING_DEEP_SEA]: "Deep Sea",
    [EstforConstants.ACTION_FISHING_GRAN_SQUIN]: "Gran Squin",
    [EstforConstants.ACTION_FISHING_LANCER]: "Lancer",
    [EstforConstants.ACTION_FISHING_DRAGONFISH]: "Dragonfish",
    [EstforConstants.ACTION_FISHING_OCTACLE]: "Octacle",
    [EstforConstants.ACTION_FISHING_SHAW]: "Shaw",
    [EstforConstants.ACTION_FISHING_VIPER_BASS]: "Viper Bass",
    [EstforConstants.ACTION_FISHING_VANISHING_PERCH]: "Vanishing Perch",
    [EstforConstants.ACTION_FISHING_YERESPATUM]: "Yerespatum",
    [EstforConstants.ACTION_FISHING_WHISKFIN]: "Whiskfin",
    [EstforConstants.ACTION_FISHING_WATER_SERPENT]: "Water Serpent",
    [EstforConstants.ACTION_FISHING_MHARA]: "Mhara",
    [EstforConstants.ACTION_FISHING_SPHINX_FISH]: "Sphinx Fish",

    [EstforConstants.ACTION_THIEVING_CHILD]: "Child",
    [EstforConstants.ACTION_THIEVING_MAN]: "Man",
    [EstforConstants.ACTION_THIEVING_GUARD]: "Guard",
    [EstforConstants.ACTION_THIEVING_CHEST]: "Chest",
    [EstforConstants.ACTION_THIEVING_STALL]: "Stall",
    [EstforConstants.ACTION_THIEVING_FARMER]: "Farmer",
    [EstforConstants.ACTION_THIEVING_FISHERMAN]: "Fisherman",
    [EstforConstants.ACTION_THIEVING_LUMBERJACK]: "Lumberjack",
    [EstforConstants.ACTION_THIEVING_BLACKSMITH]: "Blacksmith",
    [EstforConstants.ACTION_THIEVING_HEAD_GUARD]: "Head Guard",
    [EstforConstants.ACTION_THIEVING_WIZARD]: "Wizard",
    [EstforConstants.ACTION_THIEVING_POTION_SHOP]: "Potion Shop",
    [EstforConstants.ACTION_THIEVING_GEM_MERCHANT]: "Gem Merchant",
    [EstforConstants.ACTION_THIEVING_BANK]: "Bank",
    [EstforConstants.ACTION_THIEVING_MASTER_THIEF]: "Master Thief",
    [EstforConstants.ACTION_THIEVING_CATACOMBS]: "Catacombs",
    [EstforConstants.ACTION_THIEVING_ENDLESS_TUNNEL]: "Endless Tunnel",
    [EstforConstants.ACTION_THIEVING_FORGOTTEN_QUARRY]: "Forgotten Quarry",
    [EstforConstants.ACTION_THIEVING_LOST_SANCTUM]: "Lost Sanctum",
    [EstforConstants.ACTION_THIEVING_VAULT]: "Vault",

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
    [EstforConstants.ACTION_COMBAT_NATUOW]: "Natuow",
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

    [EstforConstants.ACTION_MINING_ADAMANTINE_MOTHERLODE]:
        "Adamantine Motherlode",
    [EstforConstants.ACTION_MINING_MITHRIL_MOTHERLODE]: "Mithril Motherlode",
    [EstforConstants.ACTION_MINING_RUNITE_MOTHERLODE]: "Runite Motherlode",
    [EstforConstants.ACTION_MINING_TIN_MOTHERLODE]: "Tin Motherlode",
    [EstforConstants.ACTION_MINING_TITANIUM_MOTHERLODE]: "Titanium Motherlode",

    [EstforConstants.ACTION_THIEVING_FOREST]: "Forest",
    [EstforConstants.ACTION_THIEVING_LAIR]: "Lair",
    [EstforConstants.ACTION_THIEVING_LAKE]: "Lake",
    [EstforConstants.ACTION_THIEVING_NEST]: "Nest",
    [EstforConstants.ACTION_THIEVING_HIDEOUT]: "Hideout",

    [EstforConstants.ACTION_FARMING_BLUFF]: "Bluff",
    [EstforConstants.ACTION_FARMING_CLIFFS]: "Cliffs",
    [EstforConstants.ACTION_FARMING_FOREST]: "Forest",
    [EstforConstants.ACTION_FARMING_GRASSLANDS]: "Grasslands",
    [EstforConstants.ACTION_FARMING_ITEM]: "Item",
    [EstforConstants.ACTION_FARMING_MARSHLANDS]: "Marshlands",
    [EstforConstants.ACTION_FARMING_MEADOW]: "Meadow",
    [EstforConstants.ACTION_FARMING_PLAINS]: "Plains",
    [EstforConstants.ACTION_FARMING_PLATEAU]: "Plateau",
    [EstforConstants.ACTION_FARMING_RIDGE]: "Ridge",
    [EstforConstants.ACTION_FARMING_RIVERBANK]: "Riverbank",
    [EstforConstants.ACTION_FARMING_RUINS]: "Ruins",
    [EstforConstants.ACTION_FARMING_WETLANDS]: "Wetlands",
}

export const actionChoiceNames = {
    // taken from the choices in ../data/actionChoiceId.ts
    [EstforConstants.ACTIONCHOICE_FIREMAKING_LOG]: "Ash from Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_OAK]: "Ash from Oak",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_WILLOW]: "Ash from Willow",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_MAPLE]: "Ash from Maple",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_REDWOOD]: "Ash from Redwood",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_MAGICAL]: "Ash from Magical",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_ASH]: "Ash from Ash",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_ENCHANTED]: "Ash from Enchanted",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_LIVING]: "Ash from Living",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_ASH_LOG]: "Charcoal Ash from Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_ENCHANTED_LOG]: "Charcoal Ash from Enchanted Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_LIVING_LOG]: "Charcoal Ash from Living Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_LOG]: "Charcoal Ash from Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_MAGICAL_LOG]: "Charcoal Ash from Magical Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_MAPLE_LOG]: "Charcoal Ash from Maple Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_OAK_LOG]: "Charcoal Ash from Oak Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_REDWOOD_LOG]: "Charcoal Ash from Redwood Log",
    [EstforConstants.ACTIONCHOICE_FIREMAKING_CHARCOAL_WILLOW_LOG]: "Charcoal Ash from Willow Log",

    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_BAR]: "Bronze Bar",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_BAR]: "Iron Bar",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_BAR]: "Mithril Bar",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_BAR]: "Adamantine Bar",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_BAR]: "Runite Bar",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_BAR]: "Titanium Bar",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_BAR]: "Orichalcum Bar",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_HELMET]: "Bronze Helmet",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_HELMET]: "Iron Helmet",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_HELMET]: "Mithril Helmet",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_HELMET]:
        "Adamantine Helmet",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_HELMET]: "Runite Helmet",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_HELMET]: "Titanium Helmet",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_HELMET]:
        "Orichalcum Helmet",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_ARMOR]: "Bronze Armor",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_ARMOR]: "Iron Armor",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_ARMOR]: "Mithril Armor",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_ARMOR]:
        "Adamantine Armor",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_ARMOR]: "Runite Armor",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_ARMOR]: "Titanium Armor",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_ARMOR]:
        "Orichalcum Armor",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_TASSETS]: "Bronze Tassets",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_TASSETS]: "Iron Tassets",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_TASSETS]: "Mithril Tassets",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_TASSETS]:
        "Adamantine Tassets",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_TASSETS]: "Runite Tassets",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_TASSETS]:
        "Titanium Tassets",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_TASSETS]:
        "Orichalcum Tassets",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_GAUNTLETS]:
        "Bronze Gauntlets",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_GAUNTLETS]: "Iron Gauntlets",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_GAUNTLETS]:
        "Mithril Gauntlets",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_GAUNTLETS]:
        "Adamantine Gauntlets",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_GAUNTLETS]:
        "Runite Gauntlets",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_GAUNTLETS]:
        "Titanium Gauntlets",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_GAUNTLETS]:
        "Orichalcum Gauntlets",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_BOOTS]: "Bronze Boots",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_BOOTS]: "Iron Boots",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_BOOTS]: "Mithril Boots",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_BOOTS]:
        "Adamantine Boots",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_BOOTS]: "Runite Boots",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_BOOTS]: "Titanium Boots",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_BOOTS]:
        "Orichalcum Boots",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_SHIELD]: "Bronze Shield",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_SHIELD]: "Iron Shield",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_SHIELD]: "Mithril Shield",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_SHIELD]:
        "Adamantine Shield",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_SHIELD]: "Runite Shield",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_SHIELD]: "Titanium Shield",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_SHIELD]:
        "Orichalcum Shield",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_SWORD]: "Bronze Sword",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_SWORD]: "Iron Sword",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_SWORD]: "Mithril Sword",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_SWORD]:
        "Adamantine Sword",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_SWORD]: "Runite Sword",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_SWORD]: "Titanium Sword",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_SWORD]:
        "Orichalcum Sword",
    [EstforConstants.ACTIONCHOICE_SMITHING_BRONZE_ARROW_HEAD]:
        "Bronze Arrow Head",
    [EstforConstants.ACTIONCHOICE_SMITHING_IRON_ARROW_HEAD]: "Iron Arrow Head",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_ARROW_HEAD]:
        "Mithril Arrow Head",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMANTINE_ARROW_HEAD]:
        "Adamantine Arrow Head",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_ARROW_HEAD]:
        "Runite Arrow Head",
    [EstforConstants.ACTIONCHOICE_SMITHING_TITANIUM_ARROW_HEAD]:
        "Titanium Arrow Head",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_ARROW_HEAD]:
        "Orichalcum Arrow Head",
    [EstforConstants.ACTIONCHOICE_SMITHING_ADAMA_CLEDYR_FRAGMENT]:
        "Adamantite Cledyr Fragment",
    [EstforConstants.ACTIONCHOICE_SMITHING_EFFYD_CLEDYR_FRAGMENT]:
        "Effydd Cledyr Fragment",
    [EstforConstants.ACTIONCHOICE_SMITHING_HAEARN_CLEDYR_FRAGMENT]:
        "Hae'arn Cledyr Fragment",
    [EstforConstants.ACTIONCHOICE_SMITHING_ITANUS_CLEDYR_FRAGMENT]:
        "Itanus Cledyr Fragment",
    [EstforConstants.ACTIONCHOICE_SMITHING_ITHRITH_CLEDYR_FRAGMENT]:
        "Ithryth Cledyr Fragment",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORCALITH_CLEDYR_FRAGMENT]:
        "Orcalith Cledyr Fragment",
    [EstforConstants.ACTIONCHOICE_SMITHING_RHUN_CLEDYR_FRAGMENT]:
        "Rhun Cledyr Fragment",
    [EstforConstants.ACTIONCHOICE_SMITHING_RUNITE_NAIL]: "Runite Nail",
    [EstforConstants.ACTIONCHOICE_SMITHING_ORICHALCUM_NAIL]:
        "Orichalcum Nail",
    [EstforConstants.ACTIONCHOICE_SMITHING_MITHRIL_NAIL]: "Mithril Nail",

    [EstforConstants.ACTIONCHOICE_COOKING_MINNUS]: "Cooked Minnus",
    [EstforConstants.ACTIONCHOICE_COOKING_BLEKK]: "Cooked Blekk",
    [EstforConstants.ACTIONCHOICE_COOKING_SKRIMP]: "Cooked Skrimp",
    [EstforConstants.ACTIONCHOICE_COOKING_FEOLA]: "Cooked Feola",
    [EstforConstants.ACTIONCHOICE_COOKING_ANCHO]: "Cooked Ancho",
    [EstforConstants.ACTIONCHOICE_COOKING_TROUT]: "Cooked Trout",
    [EstforConstants.ACTIONCHOICE_COOKING_ROJJA]: "Cooked Rojja",
    [EstforConstants.ACTIONCHOICE_COOKING_BOWFISH]: "Cooked Bowfish",
    [EstforConstants.ACTIONCHOICE_COOKING_GOLDFISH]: "Cooked Goldfish",
    [EstforConstants.ACTIONCHOICE_COOKING_MYSTY_BLUE]: "Cooked Mysty Blue",
    [EstforConstants.ACTIONCHOICE_COOKING_FLITFISH]: "Cooked Flitfish",
    [EstforConstants.ACTIONCHOICE_COOKING_RAZORFISH]: "Cooked Razorfish",
    [EstforConstants.ACTIONCHOICE_COOKING_QUAFFER]: "Cooked Quaffer",
    [EstforConstants.ACTIONCHOICE_COOKING_ROXA]: "Cooked Roxa",
    [EstforConstants.ACTIONCHOICE_COOKING_AZACUDDA]: "Cooked Azacudda",
    [EstforConstants.ACTIONCHOICE_COOKING_STONECLAW]: "Cooked Stoneclaw",
    [EstforConstants.ACTIONCHOICE_COOKING_CRUSKAN]: "Cooked Cruskan",
    [EstforConstants.ACTIONCHOICE_COOKING_CHODFISH]: "Cooked Chodfish",
    [EstforConstants.ACTIONCHOICE_COOKING_DOUBTFISH]: "Cooked Doubtfish",
    [EstforConstants.ACTIONCHOICE_COOKING_ROSEFIN]: "Cooked Rosefin",
    [EstforConstants.ACTIONCHOICE_COOKING_DRAGONFISH]: "Cooked Dragonfish",
    [EstforConstants.ACTIONCHOICE_COOKING_GRAN_SQUIN]: "Cooked Gran Squin",
    [EstforConstants.ACTIONCHOICE_COOKING_LANCER]: "Cooked Lancer",
    [EstforConstants.ACTIONCHOICE_COOKING_MHARA]: "Cooked Mhara",
    [EstforConstants.ACTIONCHOICE_COOKING_OCTACLE]: "Cooked Octacle",
    [EstforConstants.ACTIONCHOICE_COOKING_SHAW]: "Cooked Shaw",
    [EstforConstants.ACTIONCHOICE_COOKING_SPHINX_FISH]: "Cooked Sphinx Fish",
    [EstforConstants.ACTIONCHOICE_COOKING_VANISHING_PERCH]: "Cooked Vanishing Perch",
    [EstforConstants.ACTIONCHOICE_COOKING_VIPER_BASS]: "Cooked Viper Bass",
    [EstforConstants.ACTIONCHOICE_COOKING_WATER_SERPENT]: "Cooked Water Serpent",
    [EstforConstants.ACTIONCHOICE_COOKING_WHISKFIN]: "Cooked Whiskfin",
    [EstforConstants.ACTIONCHOICE_COOKING_YERESPATUM]: "Cooked Yerespatum",

    [EstforConstants.ACTIONCHOICE_CRAFTING_SAPPHIRE_AMULET]: "Sapphire Amulet",
    [EstforConstants.ACTIONCHOICE_CRAFTING_EMERALD_AMULET]: "Emerald Amulet",
    [EstforConstants.ACTIONCHOICE_CRAFTING_RUBY_AMULET]: "Ruby Amulet",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AMETHYST_AMULET]: "Amethyst Amulet",
    [EstforConstants.ACTIONCHOICE_CRAFTING_DIAMOND_AMULET]: "Diamond Amulet",
    [EstforConstants.ACTIONCHOICE_CRAFTING_DRAGONSTONE_AMULET]:
        "Dragonstone Amulet",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BRONZE_PICKAXE]: "Bronze Pickaxe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_IRON_PICKAXE]: "Iron Pickaxe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_MITHRIL_PICKAXE]: "Mithril Pickaxe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ADAMANTINE_PICKAXE]:
        "Adamantine Pickaxe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_RUNITE_PICKAXE]: "Runite Pickaxe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_TITANIUM_PICKAXE]:
        "Titanium Pickaxe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ORICHALCUM_PICKAXE]:
        "Orichalcum Pickaxe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BRONZE_AXE]: "Bronze Axe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_IRON_AXE]: "Iron Axe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_MITHRIL_AXE]: "Mithril Axe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ADAMANTINE_AXE]: "Adamantine Axe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_RUNITE_AXE]: "Runite Axe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_TITANIUM_AXE]: "Titanium Axe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ORICHALCUM_AXE]: "Orichalcum Axe",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATUOW_LEATHER]: "Natuow Leather",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BONEMEAL]: "Bonemeal",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BONEMEAL_MEDIUM]: "Bonemeal Medium",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BONEMEAL_LARGE]: "Bonemeal Large",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BONEMEAL_DRAGON]: "Bonemeal Dragon",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ROPE]: "Rope",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ACORN_PATCH]: "Acorn Patch",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BAT_WING_PATCH]: "Bat Wing Patch",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATUOW_HOOD]: "Natuow Hood",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATUOW_BODY]: "Natuow Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATUOW_TASSETS]: "Natuow Tassets",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATUOW_BOOTS]: "Natuow Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATUOW_BRACERS]: "Natuow Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BAT_WING_HAT]: "Bat Wing Hat",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BAT_WING_BODY]: "Bat Wing Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BAT_WING_TROUSERS]:
        "Bat Wing Trousers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BAT_WING_BOOTS]: "Bat Wing Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_BAT_WING_BRACERS]:
        "Bat Wing Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATURE_MASK]: "Nature Mask",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATURE_BODY]: "Nature Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATURE_TROUSERS]: "Nature Trousers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATURE_BOOTS]: "Nature Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_NATURE_BRACERS]: "Nature Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_TOTEM_STAFF]: "Totem Staff",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SAPPHIRE_STAFF]: "Sapphire Staff",
    [EstforConstants.ACTIONCHOICE_CRAFTING_EMERALD_STAFF]: "Emerald Staff",
    [EstforConstants.ACTIONCHOICE_CRAFTING_RUBY_STAFF]: "Ruby Staff",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AMETHYST_STAFF]: "Amethyst Staff",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AMETHYST_STAFF]: "Amethyst Staff",
    [EstforConstants.ACTIONCHOICE_CRAFTING_DIAMOND_STAFF]: "Diamond Staff",
    [EstforConstants.ACTIONCHOICE_CRAFTING_APPRENTICE_HAT]: "Apprentice Hat",
    [EstforConstants.ACTIONCHOICE_CRAFTING_APPRENTICE_BODY]: "Apprentice Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_APPRENTICE_TROUSERS]:
        "Apprentice Trousers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_APPRENTICE_GAUNTLETS]:
        "Apprentice Gauntlets",
    [EstforConstants.ACTIONCHOICE_CRAFTING_APPRENTICE_BOOTS]:
        "Apprentice Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_MAGE_HOOD]: "Mage Hood",
    [EstforConstants.ACTIONCHOICE_CRAFTING_MAGE_BODY]: "Mage Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_MAGE_TROUSERS]: "Mage Trousers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_MAGE_BRACERS]: "Mage Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_MAGE_BOOTS]: "Mage Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SORCERER_HAT]: "Sorcerer Hat",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SORCERER_BODY]: "Sorcerer Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SORCERER_TROUSERS]:
        "Sorcerer Trousers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SORCERER_GAUNTLETS]:
        "Sorcerer Gauntlets",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SORCERER_BOOTS]: "Sorcerer Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SEERS_HOOD]: "Seers Hood",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SEERS_BODY]: "Seers Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SEERS_TROUSERS]: "Seers Trousers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SEERS_BRACERS]: "Seers Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SEERS_BOOTS]: "Seers Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SHAMAN_HOOD]: "Shaman Hood",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SHAMAN_BODY]: "Shaman Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SHAMAN_TROUSERS]: "Shaman Trousers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SHAMAN_GAUNTLETS]:
        "Shaman Gauntlets",
    [EstforConstants.ACTIONCHOICE_CRAFTING_SHAMAN_BOOTS]: "Shaman Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AZAMITE_COWL]: "Azamite Cowl",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AZAMITE_BODY]: "Azamite Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AZAMITE_CHAPS]: "Azamite Chaps",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AZAMITE_BRACERS]: "Azamite Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_AZAMITE_BOOTS]: "Azamite Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_HAUBERK_COWL]: "Hauberk Cowl",
    [EstforConstants.ACTIONCHOICE_CRAFTING_HAUBERK_BODY]: "Hauberk Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_HAUBERK_CHAPS]: "Hauberk Chaps",
    [EstforConstants.ACTIONCHOICE_CRAFTING_HAUBERK_BRACERS]: "Hauberk Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_HAUBERK_BOOTS]: "Hauberk Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_GARAGOS_COWL]: "Garagos Cowl",
    [EstforConstants.ACTIONCHOICE_CRAFTING_GARAGOS_BODY]: "Garagos Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_GARAGOS_CHAPS]: "Garagos Chaps",
    [EstforConstants.ACTIONCHOICE_CRAFTING_GARAGOS_BRACERS]: "Garagos Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_GARAGOS_BOOTS]: "Garagos Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ETERNAL_COWL]: "Eternal Cowl",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ETERNAL_BODY]: "Eternal Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ETERNAL_CHAPS]: "Eternal Chaps",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ETERNAL_BRACERS]: "Eternal Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_ETERNAL_BOOTS]: "Eternal Boots",
    [EstforConstants.ACTIONCHOICE_CRAFTING_REAVER_COWL]: "Reaver Cowl",
    [EstforConstants.ACTIONCHOICE_CRAFTING_REAVER_BODY]: "Reaver Body",
    [EstforConstants.ACTIONCHOICE_CRAFTING_REAVER_CHAPS]: "Reaver Chaps",
    [EstforConstants.ACTIONCHOICE_CRAFTING_REAVER_BRACERS]: "Reaver Bracers",
    [EstforConstants.ACTIONCHOICE_CRAFTING_REAVER_BOOTS]: "Reaver Boots",

    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_LOG]: "Paper from Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_OAK]: "Paper from Oak",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_WILLOW]:
        "Paper from Willow",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_MAPLE]: "Paper from Maple",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_REDWOOD]:
        "Paper from Redwood",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_MAGICAL]:
        "Paper from Magical",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_ASH]: "Paper from Ash",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_ENCHANTED]:
        "Paper from Enchanted",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER_FROM_LIVING]:
        "Paper from Living",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_SHADOW_SCROLL]: "Shadow Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_NATURE_SCROLL]: "Nature Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_AQUA_SCROLL]: "Aqua Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_HELL_SCROLL]: "Hell Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_AIR_SCROLL]: "Air Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_BARRAGE_SCROLL]: "Barrage Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_FREEZE_SCROLL]: "Freeze Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_ANCIENT_SCROLL]: "Ancient Scroll",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_COPPER_ORE]: "Copper Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_TIN_ORE]: "Tin Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_IRON_ORE]: "Iron Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_SAPPHIRE]: "Sapphire",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_COAL_ORE]: "Coal Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_EMERALD]: "Emerald",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_MITHRIL_ORE]: "Mithril Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_RUBY]: "Ruby",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_ADAMANTINE_ORE]: "Adamantine Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_AMETHYST]: "Amethyst",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_DIAMOND]: "Diamond",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_RUNITE_ORE]: "Runite Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_DRAGONSTONE]: "Dragonstone",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_TITANIUM_ORE]: "Titanium Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_ORICHALCUM_ORE]: "Orichalcum Ore",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_FEATHER]: "Feather",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_LOG]: "Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_OAK_LOG]: "Oak Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_WILLOW_LOG]: "Willow Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_MAPLE_LOG]: "Maple Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_REDWOOD_LOG]: "Redwood Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_MAGICAL_LOG]: "Magical Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_ASH_LOG]: "Ash Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_ENCHANTED_LOG]: "Enchanted Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_LIVING_LOG]: "Living Log",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_PAPER]: "Paper",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_HEALING_POTION_L]: "Healing Potion (L)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_HEALING_POTION_M]: "Healing Potion (M)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_HEALING_POTION_S]: "Healing Potion (S)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_DEFENCE_BOOST_POTION_L]: "Defence Boost Potion (L)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_DEFENCE_BOOST_POTION_S]: "Defence Boost Potion (S)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_HEALTH_BOOST_POTION_L]: "Health Boost Potion (L)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_HEALTH_BOOST_POTION_S]: "Health Boost Potion (S)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_MAGIC_BOOST_POTION_L]: "Magic Boost Potion (L)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_MAGIC_BOOST_POTION_S]: "Magic Boost Potion (S)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_LUMELILA_TOXIN]: "Lumelila Toxin",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_FOOLS_BERRY_EXTRACT]: "Fools Berry Extract",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_MELEE_BOOST_POTION_L]: "Melee Boost Potion (L)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_MELEE_BOOST_POTION_S]: "Melee Boost Potion (S)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_RANGED_BOOST_POTION_L]: "Ranged Boost Potion (L)",
    [EstforConstants.ACTIONCHOICE_ALCHEMY_RANGED_BOOST_POTION_S]: "Ranged Boost Potion (S)",    

    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_LOG]:
        "Arrow Shaft from Log",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_OAK]:
        "Arrow Shaft from Oak",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_WILLOW]:
        "Arrow Shaft from Willow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_MAPLE]:
        "Arrow Shaft from Maple",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_REDWOOD]:
        "Arrow Shaft from Redwood",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_MAGICAL]:
        "Arrow Shaft from Magical",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_ASH]:
        "Arrow Shaft from Ash",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_ENCHANTED]:
        "Arrow Shaft from Enchanted",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ARROW_SHAFT_FROM_LIVING]:
        "Arrow Shaft from Living",
    [EstforConstants.ACTIONCHOICE_FLETCHING_BRONZE_ARROW]: "Bronze Arrow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_IRON_ARROW]: "Iron Arrow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_MITHRIL_ARROW]: "Mithril Arrow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ADAMANTINE_ARROW]:
        "Adamantine Arrow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_RUNITE_ARROW]: "Runite Arrow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_TITANIUM_ARROW]: "Titanium Arrow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ORICHALCUM_ARROW]:
        "Orichalcum Arrow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_BASIC_BOW]: "Basic Bow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_BONE_BOW]: "Bone Bow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_EXPERT_BOW]: "Expert Bow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_SPECTRAL_BOW]: "Spectral Bow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_ICY_BOW]: "Icy Bow",
    [EstforConstants.ACTIONCHOICE_FLETCHING_GLITTERING_BOW]: "Glittering Bow",

    [EstforConstants.ACTIONCHOICE_FORGING_MERGE_TINY_ELIXIUM]:
        "Merge Tiny Elixium",
    [EstforConstants.ACTIONCHOICE_FORGING_MERGE_SMALL_ELIXIUM]:
        "Merge Small Elixium",
    [EstforConstants.ACTIONCHOICE_FORGING_MERGE_MEDIUM_ELIXIUM]:
        "Merge Medium Elixium",
    [EstforConstants.ACTIONCHOICE_FORGING_MERGE_LARGE_ELIXIUM]:
        "Merge Large Elixium",

    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_LARGE_ANCIENT_SEED]:
        "Cultivate Large Ancient Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_LARGE_MYSTERIOUS_SEED]:
        "Cultivate Large Mysterious Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_LARGE_OBSCURE_SEED]:
        "Cultivate Large Obscure Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_LARGE_UNKNOWN_SEED]:
        "Cultivate Large Unknown Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_LARGE_WILD_SEED]:
        "Cultivate Large Wild Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_MEDIUM_MYSTERIOUS_SEED]:
        "Cultivate Medium Mysterious Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_MEDIUM_OBSCURE_SEED]:
        "Cultivate Medium Obscure Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_MEDIUM_UNKNOWN_SEED]:
        "Cultivate Medium Unknown Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_MEDIUM_WILD_SEED]:
        "Cultivate Medium Wild Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_SMALL_MYSTERIOUS_SEED]:
        "Cultivate Small Mysterious Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_SMALL_UNKNOWN_SEED]:
        "Cultivate Small Unknown Seed",
    [EstforConstants.ACTIONCHOICE_FARMING_CULTIVATE_SMALL_WILD_SEED]:
        "Cultivate Small Wild Seed",
}

export interface RelevantActionInput {
    minXP: number
    xpPerHour: number
    actionId: number
    name: string
}

export enum ActionType {
    action,
    actionChoice,
    actionAndChoice,
}

export interface RelevantAction {
    currentAction: RelevantActionInput
    nextAction: RelevantActionInput | undefined
    currentXPForSkill: number
    skill: Skill
    actionType: ActionType
    hasItemSearch: boolean
}

export const getActionChoiceById = (
    actionId: number,
    choiceId: number
): ActionChoiceInput | undefined => {
    switch (actionId) {
        case EstforConstants.ACTION_COOKING_ITEM:
            return allActionChoicesCooking[
                allActionChoiceIdsCooking.indexOf(choiceId)
            ]
        case EstforConstants.ACTION_CRAFTING_ITEM:
            return allActionChoicesCrafting[
                allActionChoiceIdsCrafting.indexOf(choiceId)
            ]
        case EstforConstants.ACTION_SMITHING_ITEM:
            return allActionChoicesSmithing[
                allActionChoiceIdsSmithing.indexOf(choiceId)
            ]
        case EstforConstants.ACTION_FIREMAKING_ITEM:
            return allActionChoicesFiremaking[
                allActionChoiceIdsFiremaking.indexOf(choiceId)
            ]
        case EstforConstants.ACTION_ALCHEMY_ITEM:
            return allActionChoicesAlchemy[
                allActionChoiceIdsAlchemy.indexOf(choiceId)
            ]
        case EstforConstants.ACTION_FORGING_ITEM:
            return allActionChoicesForging[
                allActionChoiceIdsForging.indexOf(choiceId)
            ]
        case EstforConstants.ACTION_FLETCHING_ITEM:
            return allActionChoicesFletching[
                allActionChoiceIdsFletching.indexOf(choiceId)
            ]
        case EstforConstants.ACTION_FARMING_ITEM:
            return allActionChoicesFarming[
                allActionChoiceIdsFarming.indexOf(choiceId)
            ]
        default:
            return undefined
    }
}

export const getCombatActionChoiceById = (
    choiceId: number
): ActionChoiceInput | undefined => {
    if (allActionChoiceIdsRanged.findIndex((x) => x === choiceId) > -1) {
        return allActionChoicesRanged[
            allActionChoiceIdsRanged.indexOf(choiceId)
        ]
    } else if (allActionChoiceIdsMagic.findIndex((x) => x === choiceId) > -1) {
        return allActionChoicesMagic[allActionChoiceIdsMagic.indexOf(choiceId)]
    } else if (allActionChoiceIdsMelee.findIndex((x) => x === choiceId) > -1) {
        return allActionChoicesMelee[allActionChoiceIdsMelee.indexOf(choiceId)]
    }
}

export const useSkillStore = defineStore("skills", {
    state: () =>
        ({
            woodcutting: allActions.filter(
                (x) => x.info.skill === Skill.WOODCUTTING
            ) as ActionInput[],
            mining: allActions.filter(
                (x) => x.info.skill === Skill.MINING
            ) as ActionInput[],
            fishing: allActions.filter(
                (x) => x.info.skill === Skill.FISHING
            ) as ActionInput[],
            cooking: [...allActionChoicesCooking],
            crafting: [...allActionChoicesCrafting],
            smithing: [...allActionChoicesSmithing],
            firemaking: [...allActionChoicesFiremaking],
            alchemy: [...allActionChoicesAlchemy],
            forging: [...allActionChoicesForging],
            fletching: [...allActionChoicesFletching],
            combat: allActions.filter(
                (x) => x.info.skill === Skill.COMBAT
            ) as ActionInput[],
            thieving: allActions.filter(
                (x) => x.info.skill === Skill.THIEVING
            ) as ActionInput[],
            farming: [
                ...allActionChoicesFarming,
                ...allActions.filter((x) => x.info.skill === Skill.FARMING),
            ] as (ActionInput | ActionChoiceInput)[],
        }) as SkillState,
    getters: {
        getActionInputsForSkill: (state: SkillState) => {
            return (skill: Skill): ActionInput[] => {
                switch (skill) {
                    case Skill.WOODCUTTING:
                        return state.woodcutting
                    case Skill.MINING:
                        return state.mining
                    case Skill.FISHING:
                        return state.fishing
                    case Skill.THIEVING:
                        return state.thieving
                    case Skill.COMBAT:
                        return state.combat
                    case Skill.FARMING:
                        return state.farming.filter(
                            (x) => "info" in x
                        ) as ActionInput[]
                    default:
                        return []
                }
            }
        },
        getActionChoiceInputsForSkill: () => {
            return (skill: Skill): number[] => {
                switch (skill) {
                    case Skill.COOKING:
                        return [...allActionChoiceIdsCooking]
                    case Skill.CRAFTING:
                        return [...allActionChoiceIdsCrafting]
                    case Skill.SMITHING:
                        return [...allActionChoiceIdsSmithing]
                    case Skill.FIREMAKING:
                        return [...allActionChoiceIdsFiremaking]
                    case Skill.ALCHEMY:
                        return [...allActionChoiceIdsAlchemy]
                    case Skill.FORGING:
                        return [...allActionChoiceIdsForging]
                    case Skill.FLETCHING:
                        return [...allActionChoiceIdsFletching]
                    case Skill.FARMING:
                        return [...allActionChoiceIdsFarming]
                    default:
                        return []
                }
            }
        },
        getActionChoicesForSkill: () => {
            return (skill: Skill): ActionChoiceInput[] => {
                switch (skill) {
                    case Skill.COOKING:
                        return [...allActionChoicesCooking]
                    case Skill.CRAFTING:
                        return [...allActionChoicesCrafting]
                    case Skill.SMITHING:
                        return [...allActionChoicesSmithing]
                    case Skill.FIREMAKING:
                        return [...allActionChoicesFiremaking]
                    case Skill.ALCHEMY:
                        return [...allActionChoicesAlchemy]
                    case Skill.FORGING:
                        return [...allActionChoicesForging]
                    case Skill.FLETCHING:
                        return [...allActionChoicesFletching]
                    case Skill.FARMING:
                        return [...allActionChoicesFarming]
                    default:
                        return []
                }
            }
        },
        getCurrentAndNextActionForSkill: (state: SkillState) => {
            return (skill: Skill): RelevantAction => {
                let inputChoices: ActionChoiceInput[] = []
                let inputs: ActionInput[] = []
                let inputsAndChoices: (ActionInput | ActionChoiceInput)[] = []
                let isActionChoice = false
                let isInputAndChoice = false
                const coreStore = useCoreStore()
                const searchStore = useSearchStore()
                const playerState = coreStore.playerState
                let currentXPForSkill = 1
                let hasItemSearch = false
                switch (skill) {
                    case Skill.WOODCUTTING:
                        inputs = state.woodcutting
                        currentXPForSkill = parseInt(
                            playerState.woodcuttingXP,
                            10
                        )
                        break
                    case Skill.MINING:
                        inputs = state.mining
                        currentXPForSkill = parseInt(playerState.miningXP, 10)
                        break
                    case Skill.FISHING:
                        inputs = state.fishing
                        currentXPForSkill = parseInt(playerState.fishingXP, 10)
                        break
                    case Skill.COOKING:
                        inputChoices = state.cooking
                        currentXPForSkill = parseInt(playerState.cookingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.CRAFTING:
                        inputChoices = state.crafting
                        currentXPForSkill = parseInt(playerState.craftingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.SMITHING:
                        inputChoices = state.smithing
                        currentXPForSkill = parseInt(playerState.smithingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.FIREMAKING:
                        inputChoices = state.firemaking
                        currentXPForSkill = parseInt(
                            playerState.firemakingXP,
                            10
                        )
                        isActionChoice = true
                        break
                    case Skill.ALCHEMY:
                        inputChoices = state.alchemy
                        currentXPForSkill = parseInt(playerState.alchemyXP, 10)
                        isActionChoice = true
                        break
                    case Skill.FARMING:
                        inputsAndChoices = state.farming
                        currentXPForSkill = parseInt(playerState.farmingXP, 10)
                        isInputAndChoice = true
                        break
                    case Skill.FORGING:
                        inputChoices = state.forging
                        currentXPForSkill = parseInt(playerState.forgingXP, 10)
                        isActionChoice = true
                        break
                    case Skill.FLETCHING:
                        inputChoices = state.fletching
                        currentXPForSkill = parseInt(
                            playerState.fletchingXP,
                            10
                        )
                        isActionChoice = true
                        break
                    case Skill.THIEVING:
                        inputs = state.thieving
                        currentXPForSkill = parseInt(playerState.thievingXP, 10)
                        break
                }

                let currentAction: RelevantActionInput = {
                    minXP: 0,
                    xpPerHour: 0,
                    actionId: 0,
                    name: "",
                }
                let nextAction: RelevantActionInput | undefined

                if (!isActionChoice || isInputAndChoice) {
                    if (isInputAndChoice) {
                        inputs = inputsAndChoices.filter(
                            (x) => "info" in x
                        ) as ActionInput[]
                    }
                    inputs.sort((a, b) => {
                        if (b.info.xpPerHour > a.info.xpPerHour) return -1
                        if (b.info.xpPerHour < a.info.xpPerHour) return 1

                        if (b.info.minXP > a.info.minXP) return -1
                        if (b.info.minXP < a.info.minXP) return 1

                        return 0
                    })

                    currentAction = {
                        minXP: inputs[0].info.minXP,
                        xpPerHour: inputs[0].info.xpPerHour,
                        actionId: inputs[0].actionId,
                        name: actionNames[inputs[0].actionId],
                    }
                    const availableActionsToPlayer = inputs.filter(
                        (x) => x.info.minXP <= currentXPForSkill
                    )
                    if (availableActionsToPlayer.length > 0) {
                        const lastAction =
                            availableActionsToPlayer[
                                availableActionsToPlayer.length - 1
                            ]
                        currentAction.minXP = lastAction.info.minXP
                        currentAction.xpPerHour = lastAction.info.xpPerHour
                        currentAction.actionId = lastAction.actionId
                        currentAction.name = actionNames[lastAction.actionId]
                    }
                    const nextActions = inputs.filter(
                        (x) =>
                            x.info.minXP >= currentAction.minXP &&
                            x.info.xpPerHour > currentAction.xpPerHour
                    )
                    if (nextActions.length > 1) {
                        nextActions.sort((a, b) => {
                            if (b.info.minXP > a.info.minXP) return -1
                            if (b.info.minXP < a.info.minXP) return 1

                            if (b.info.xpPerHour > a.info.xpPerHour) return -1
                            if (b.info.xpPerHour < a.info.xpPerHour) return 1
                            return 0
                        })
                        nextAction = {
                            minXP: nextActions[0].info.minXP,
                            xpPerHour: nextActions[0].info.xpPerHour,
                            actionId: nextActions[0].actionId,
                            name: actionNames[nextActions[0].actionId],
                        }
                    }

                    if (
                        inputs.some(
                            (x) =>
                                x.guaranteedRewards.some(
                                    (y) =>
                                        getItemName(y.itemTokenId)
                                            ?.toLowerCase()
                                            .includes(
                                                searchStore.itemSearch.toLowerCase()
                                            )
                                ) ||
                                x.randomRewards.some(
                                    (y) =>
                                        getItemName(y.itemTokenId)
                                            ?.toLowerCase()
                                            .includes(
                                                searchStore.itemSearch.toLowerCase()
                                            )
                                ) ||
                                getItemName(x.info.handItemTokenIdRangeMax)
                                    ?.toLowerCase()
                                    .includes(
                                        searchStore.itemSearch.toLowerCase()
                                    ) ||
                                getItemName(x.info.handItemTokenIdRangeMax)
                                    ?.toLowerCase()
                                    .includes(
                                        searchStore.itemSearch.toLowerCase()
                                    )
                        )
                    ) {
                        hasItemSearch = true
                    }
                }

                if (isActionChoice || isInputAndChoice) {
                    if (isInputAndChoice) {
                        inputChoices = inputsAndChoices.filter(
                            (x) => !("info" in x)
                        ) as ActionChoiceInput[]
                    }
                    inputChoices.sort((a, b) => {
                        if (b.xpPerHour > a.xpPerHour) return -1
                        if (b.xpPerHour < a.xpPerHour) return 1

                        if (
                            b.skillMinXPs[b.skills.indexOf(skill)] >
                            a.skillMinXPs[b.skills.indexOf(skill)]
                        )
                            return -1
                        if (
                            b.skillMinXPs[b.skills.indexOf(skill)] <
                            a.skillMinXPs[b.skills.indexOf(skill)]
                        )
                            return 1
                        return 0
                    })

                    currentAction = {
                        minXP: inputChoices[0].skillMinXPs[0],
                        xpPerHour: inputChoices[0].xpPerHour,
                        actionId: inputChoices[0].outputTokenId,
                        name: getItemName(inputChoices[0].outputTokenId),
                    }

                    const availableActionsToPlayer = inputChoices.filter((x) =>
                        x.skillMinXPs.every(
                            (y, i) =>
                                y <= currentXPForSkill && x.skills[i] === skill
                        )
                    )
                    if (availableActionsToPlayer.length > 0) {
                        const lastAction =
                            availableActionsToPlayer[
                                availableActionsToPlayer.length - 1
                            ]
                        currentAction.minXP =
                            lastAction.skillMinXPs[
                                lastAction.skills.findIndex(
                                    (x) => x === lastAction.skill
                                )
                            ] || 0
                        currentAction.xpPerHour = lastAction.xpPerHour
                        currentAction.actionId = lastAction.outputTokenId
                        currentAction.name = getItemName(
                            lastAction.outputTokenId
                        )
                    }
                    const nextActions = inputChoices.filter(
                        (x) =>
                            x.skillMinXPs.some(
                                (y, i) =>
                                    y >= currentAction.minXP &&
                                    x.skills[i] === skill
                            ) && x.xpPerHour > currentAction.xpPerHour
                    )

                    if (nextActions.length > 0) {
                        nextActions.sort((a, b) => {
                            if (
                                b.skillMinXPs[b.skills.indexOf(skill)] >
                                a.skillMinXPs[b.skills.indexOf(skill)]
                            )
                                return -1
                            if (
                                b.skillMinXPs[b.skills.indexOf(skill)] <
                                a.skillMinXPs[b.skills.indexOf(skill)]
                            )
                                return 1

                            if (b.xpPerHour > a.xpPerHour) return -1
                            if (b.xpPerHour < a.xpPerHour) return 1
                            return 0
                        })
                        nextAction = {
                            minXP:
                                nextActions[0].skillMinXPs[
                                    nextActions[0].skills.findIndex(
                                        (x) => x === skill
                                    )
                                ] || 0,
                            xpPerHour: nextActions[0].xpPerHour,
                            actionId: nextActions[0].outputTokenId,
                            name: getItemName(nextActions[0].outputTokenId),
                        }
                    }

                    if (
                        inputChoices.some(
                            (x) =>
                                x.inputTokenIds.some(
                                    (y) =>
                                        getItemName(y)
                                            ?.toLowerCase()
                                            .includes(
                                                searchStore.itemSearch.toLowerCase()
                                            )
                                ) ||
                                getItemName(x.outputTokenId)
                                    ?.toLowerCase()
                                    .includes(
                                        searchStore.itemSearch.toLowerCase()
                                    ) ||
                                getItemName(x.handItemTokenIdRangeMax)
                                    ?.toLowerCase()
                                    .includes(
                                        searchStore.itemSearch.toLowerCase()
                                    ) ||
                                getItemName(x.handItemTokenIdRangeMax)
                                    ?.toLowerCase()
                                    .includes(
                                        searchStore.itemSearch.toLowerCase()
                                    )
                        )
                    ) {
                        hasItemSearch = true
                    }
                }
                return {
                    currentAction,
                    nextAction,
                    currentXPForSkill,
                    skill,
                    actionType: isInputAndChoice
                        ? ActionType.actionAndChoice
                        : isActionChoice
                          ? ActionType.actionChoice
                          : ActionType.action,
                    hasItemSearch,
                }
            }
        },
    },
    actions: {},
})
