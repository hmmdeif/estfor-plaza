<template>
    <div class="flex items-center justify-between">
        <div></div>
        <DateSelect v-model="date" @update:model-value="onDateUpdate" />
    </div>
    <div class="overflow-x-auto">
        <table class="table md:table-md table-xs">
            <thead>
                <tr>
                    <th class="w-[80px] text-center"></th>
                    <th>Name</th>
                    <th class="text-right">Total Contributed</th>
                    <th class="text-right">Joined</th>
                    <th class="text-right">
                        <div class="flex gap-1 items-center justify-end">
                            Days Wished
                            <ChevronUpDownIcon
                                v-if="currentSort != 'daysDonated'"
                                class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                @click="updateSort('daysDonated', 'desc')"
                            />
                            <ChevronDownIcon
                                v-else-if="
                                    currentSort == 'daysDonated' &&
                                    currentDirection == 'desc'
                                "
                                class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                @click="updateSort('daysDonated', 'asc')"
                            />
                            <ChevronUpIcon
                                v-else
                                class="w-6 text-white hover:text-gray-400 cursor-pointer"
                                @click="updateSort(null, 'desc')"
                            />
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody v-if="loading" class="mx-auto my-[100px] w-full text-center">
                <tr>
                    <td colspan="5">
                        <span
                            class="loading loading-spinner text-primary loading-md mx-auto"
                        ></span>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                <tr
                    v-for="m in sortedMembers"
                    :key="m.player.id"
                    class="hover:bg-base-100-50"
                    :class="{
                        'text-warning': m.daysDonated + 2 === date,
                        'text-error': m.daysDonated + 2 < date,
                    }"
                >
                    <td class="avatar">
                        <div class="mask mask-square rounded-lg w-12 h-12">
                            <img
                                :src="characterThumbSource(m.player.avatarId)"
                            />
                        </div>
                    </td>
                    <td>{{ m.player.name }}</td>
                    <td class="text-right">
                        {{
                            (
                                BigInt(m.totalDonated) / BigInt(10 ** 18)
                            ).toString()
                        }}
                    </td>
                    <td class="text-right">
                        {{ formatDate(m.joinedTimestamp) }}
                    </td>
                    <td class="text-right">{{ m.daysDonated }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue"
import { ClanMember } from "../../utils/api"
import DateSelect from "../inputs/DateSelect.vue"
import { getRaffleEntries } from "../../utils/api"
import { RaffleEntry } from "@paintswap/estfor-definitions/types"
import {
    ChevronUpDownIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/vue/24/solid"
import { formatDate } from "../../utils/time"
import { characterThumbSource } from "../../utils/media"

const date = ref(7)
const raffleEntries = ref<RaffleEntry[]>([])
const loading = ref(false)

const currentSort = ref<string | null>(null)
const currentDirection = ref("desc")

const updateSort = (sort: string | null, direction: string) => {
    currentSort.value = sort
    currentDirection.value = direction
}

const sortedMembers = computed(() => {
    const m = props.members.map((m) => {
        return {
            ...m,
            daysDonated: raffleEntries.value.filter(
                (x) => x.playerId.toString() === m.player.id.toString()
            ).length,
        }
    })
    m.sort((a, b) => {
        if (currentSort.value) {
            if (currentDirection.value == "desc") {
                // @ts-ignore
                return b[currentSort.value] > a[currentSort.value] ? 1 : -1
            } else {
                // @ts-ignore
                return a[currentSort.value] > b[currentSort.value] ? 1 : -1
            }
        } else {
            if (BigInt(b.totalDonated) > BigInt(a.totalDonated)) {
                return 1
            } else if (BigInt(b.totalDonated) < BigInt(a.totalDonated)) {
                return -1
            }
        }
        return 0
    })
    return m
})

const onDateUpdate = async () => {
    loading.value = true
    try {
        const timestamp = new Date()
        timestamp.setDate(timestamp.getDate() - date.value)
        timestamp.setHours(0, 0, 0, 0)

        const endTimestamp = new Date()
        endTimestamp.setHours(0, 0, 0, 0)
        {
            let numToSkip = 0
            let moreToFetch = true
            const raffleResults: RaffleEntry[] = []
            while (moreToFetch) {
                const results = await getRaffleEntries(numToSkip)
                raffleResults.push(...results.raffleEntries)
                if (results.raffleEntries.length < 1000) {
                    moreToFetch = false
                } else {
                    numToSkip += 1000
                }
            }

            raffleEntries.value = raffleResults
                .filter(
                    (x) =>
                        parseInt(x.timestamp) >= timestamp.valueOf() / 1000 &&
                        parseInt(x.timestamp) < endTimestamp.valueOf() / 1000
                )
                .filter((x) =>
                    props.members.map((x) => x.player.id).includes(x.playerId)
                )
        }
    } finally {
        loading.value = false
    }
}

const props = defineProps<{
    members: ClanMember[]
}>()

onMounted(onDateUpdate)
</script>
