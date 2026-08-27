<template>
    <div class="flex max-xl:flex-col flex-row justify-evenly xl:gap-10">
        <div
            class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 grow"
        >
            <div class="card-body">
                <div
                    v-if="loading"
                    class="mx-auto my-[100px] w-full text-center"
                >
                    <span
                        class="loading loading-spinner text-primary loading-md mx-auto"
                    ></span>
                </div>
                <div v-else>
                    <div class="overflow-x-auto">
                        <table class="table md:table-md table-xs">
                            <caption class="caption-top mb-5 text-lg">
                                Wishing Well Luckiest Heroes
                            </caption>
                            <thead>
                                <tr>
                                    <th class="w-[80px] text-center">Avatar</th>
                                    <th>Name</th>
                                    <th class="text-right">Times Won</th>
                                    <th class="text-right">Times Entered</th>
                                    <th class="max-sm:w-[90px] text-right">
                                        % Won
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="w in winners" :key="w.playerId">
                                    <td class="avatar">
                                        <div
                                            class="mask mask-square rounded-lg w-12 h-12"
                                        >
                                            <img
                                                :src="characterThumbSource(w.avatarId)"
                                            />
                                        </div>
                                    </td>
                                    <td>{{ w.name }}</td>
                                    <td class="text-right">{{ w.count }}</td>
                                    <td class="text-right">{{ w.attempts }}</td>
                                    <td class="text-right">
                                        {{ (w.luck * 100).toFixed(2) }} %
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="card bg-base-100-50 shadow-xl rounded-lg mt-2 md:mt-10 grow"
        >
            <div class="card-body">
                <div
                    v-if="loading"
                    class="mx-auto my-[100px] w-full text-center"
                >
                    <span
                        class="loading loading-spinner text-primary loading-md mx-auto"
                    ></span>
                </div>
                <div v-else>
                    <div class="overflow-x-auto">
                        <table class="table md:table-md table-xs">
                            <caption class="caption-top mb-5 text-lg">
                                Wishing Well Unluckiest Heroes
                            </caption>
                            <thead>
                                <tr>
                                    <th class="w-[80px] text-center">Avatar</th>
                                    <th>Name</th>
                                    <th class="text-right">Times Won</th>
                                    <th class="text-right">Times Entered</th>
                                    <th class="text-right">% Won</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="l in losers" :key="l.playerId">
                                    <td class="avatar">
                                        <div
                                            class="mask mask-square rounded-lg w-12 h-12"
                                        >
                                            <img
                                                :src="characterThumbSource(l.avatarId)"
                                            />
                                        </div>
                                    </td>
                                    <td>{{ l.name }}</td>
                                    <td class="text-right">{{ l.count }}</td>
                                    <td class="text-right">{{ l.attempts }}</td>
                                    <td class="text-right">
                                        {{ (l.luck * 100).toFixed(2) }} %
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { getLotteries, getRaffleEntries, getPlayersByIds } from "../utils/api"
import { Lottery, RaffleEntry } from "@paintswap/estfor-definitions/types"
import { characterThumbSource } from "../utils/media"

interface LotteryRank {
    playerId: string
    count: number
    attempts: number
    avatarId: string
    name: string
    luck: number
}

const loading = ref(false)
const winners = ref<LotteryRank[]>([])
const losers = ref<LotteryRank[]>([])

const init = async () => {
    loading.value = true

    let lotteryRawResults = [] as Lottery[]
    let raffleEntries = [] as RaffleEntry[]
    {
        let numToSkip = 0
        let moreToFetch = true
        const lotteryResults = []
        while (moreToFetch) {
            const results = await getLotteries(numToSkip)
            lotteryResults.push(...results.lotteries)
            if (results.lotteries.length < 1000) {
                moreToFetch = false
            } else {
                numToSkip += 1000
            }
        }
        lotteryRawResults = lotteryResults
    }

    {
        let numToSkip = 0
        let moreToFetch = true
        const raffleResults = []
        while (moreToFetch) {
            const results = await getRaffleEntries(numToSkip)
            raffleResults.push(...results.raffleEntries)
            if (results.raffleEntries.length < 1000) {
                moreToFetch = false
            } else {
                numToSkip += 1000
            }
        }
        raffleEntries = raffleResults
    }

    const lotteryRanks = raffleEntries.reduce((acc, curr) => {
        const winningRaffle = lotteryRawResults.find(
            (x) => x.raffleIdWinner === curr.raffleId && x.id === curr.lotteryId
        )
        const r = acc.find((x) => x.playerId === curr.playerId)
        if (r) {
            r.attempts++
            if (winningRaffle) {
                r.count++
            }
            r.luck = r.count / r.attempts
        } else {
            acc.push({
                playerId: curr.playerId,
                attempts: 1,
                count: winningRaffle ? 1 : 0,
                avatarId: "",
                name: "",
                luck: winningRaffle ? 1 : 0,
            })
        }
        return acc
    }, [] as LotteryRank[])

    const topWinners = lotteryRanks
        .sort((a, b) =>
            b.count < a.count
                ? -1
                : b.count > a.count
                  ? 1
                  : b.luck < a.luck
                    ? -1
                    : b.luck > a.luck
                      ? 1
                      : 0
        )
        .slice(0, 10)
    const topLosers = lotteryRanks
        .sort((a, b) =>
            b.count > a.count
                ? -1
                : b.count < a.count
                  ? 1
                  : b.attempts < a.attempts
                    ? -1
                    : b.attempts > a.attempts
                      ? 1
                      : 0
        )
        .slice(0, 10)

    const playerResult = await getPlayersByIds(
        [
            ...topWinners.map((x) => x.playerId),
            ...topLosers.map((x) => x.playerId),
        ],
        0,
    )
    for (const p of playerResult.players) {
        const rank = topWinners.find((x) => x.playerId === p.id)
        if (rank) {
            rank.avatarId = p.avatarId
            rank.name = p.name
        }

        const loserRank = topLosers.find((x) => x.playerId === p.id)
        if (loserRank) {
            loserRank.avatarId = p.avatarId
            loserRank.name = p.name
        }
    }
    winners.value = topWinners
    losers.value = topLosers

    loading.value = false
}

onMounted(init)
</script>
