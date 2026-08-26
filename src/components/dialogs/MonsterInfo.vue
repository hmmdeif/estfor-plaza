<template>
    <dialog id="monster_modal" class="modal">
        <div class="modal-box bg-base-100 border-2 border-primary">
            <h3 class="font-bold text-lg text-center">
                {{ monsterNames[monster?.actionId] }}
            </h3>
            <img
                :src="imgSource"
                :alt="monsterNames[monster?.actionId]"
                class="w-full mx-auto mt-5"
            />

            <div class="text-center mt-5">
                {{ monster?.info.numSpawned / 1000 }} spawned per hour for
                {{
                    (
                        monster?.info.xpPerHour /
                        (monster?.info.numSpawned / 1000)
                    ).toFixed(0)
                }}
                xp each
            </div>

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Melee"
                                >
                                    <img
                                        src="/src/assets/optimized/melee-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Melee"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Ranged"
                                >
                                    <img
                                        src="/src/assets/optimized/ranged-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Ranged"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Magic"
                                >
                                    <img
                                        src="/src/assets/optimized/magic-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Magic"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Melee Defence"
                                >
                                    <img
                                        src="/src/assets/optimized/melee_def-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Melee Defence"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Ranged Defence"
                                >
                                    <img
                                        src="/src/assets/optimized/ranged_def-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Ranged Defence"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Magic Defence"
                                >
                                    <img
                                        src="/src/assets/optimized/magic_def-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Magic Defence"
                                    />
                                </div>
                            </th>
                            <th class="text-right">
                                <div
                                    class="tooltip tooltip-primary tooltip-bottom w-full"
                                    data-tip="Health"
                                >
                                    <img
                                        src="/src/assets/optimized/health-80.webp"
                                        class="mask mask-squircle md:w-10 w-6 mx-auto"
                                        alt="Health"
                                    />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-center">
                                {{ monster?.combatStats.meleeAttack }}
                            </td>
                            <td class="text-center">
                                {{ monster?.combatStats.rangedAttack }}
                            </td>
                            <td class="text-center">
                                {{ monster?.combatStats.magicAttack }}
                            </td>
                            <td class="text-center">
                                {{ monster?.combatStats.meleeDefence }}
                            </td>
                            <td class="text-center">
                                {{ monster?.combatStats.rangedDefence }}
                            </td>
                            <td class="text-center">
                                {{ monster?.combatStats.magicDefence }}
                            </td>
                            <td class="text-center">
                                {{ monster?.combatStats.health }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="overflow-x-auto mt-5">
                <table class="table md:table-md table-xs">
                    <thead>
                        <tr>
                            <th class="text-left">Item</th>
                            <th class="text-right">Amount</th>
                            <th class="text-right">Chance per hour</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="i in monster?.guaranteedRewards">
                            <td
                                class="text-left cursor-pointer"
                                @click.prevent="
                                    itemStore.itemSearch = getItemName(
                                        i.itemTokenId
                                    )
                                "
                            >
                                {{ getItemName(i.itemTokenId) || "Unknown" }}
                            </td>
                            <td class="text-right">{{ i.rate / 10 }}</td>
                            <td class="text-right">100%</td>
                        </tr>
                        <tr v-for="i in monster?.randomRewards">
                            <td
                                class="text-left cursor-pointer"
                                @click.prevent="
                                    itemStore.itemSearch = getItemName(
                                        i.itemTokenId
                                    )
                                "
                            >
                                {{ getItemName(i.itemTokenId) }}
                            </td>
                            <td class="text-right">{{ i.amount }}</td>
                            <td class="text-right">
                                {{ ((i.chance * 100) / 65535).toFixed(2) }}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import {
    monsterNames,
    monsterImageMap,
    useMonsterStore,
} from "../../store/monsters"
import { MEDIA_URL } from "../../store/core"
import { getItemName, useItemStore } from "../../store/items"

const monsterStore = useMonsterStore()
const itemStore = useItemStore()

const monsterId = ref(0)

const monster = computed(() => {
    return monsterStore.monsters.find((x) => x.actionId === monsterId.value)
})

const imgSource = computed(() => {
    return `${MEDIA_URL}/monsters/${
        monsterImageMap[monster.value?.actionId] || "monster_1_9zp1zn5o.jpg"
    }`
})

const openDialog = (_monsterId: number) => {
    monsterId.value = _monsterId
    const dialog = document.getElementById("monster_modal") as HTMLDialogElement
    dialog.showModal()
}

defineExpose({
    openDialog,
})
</script>
