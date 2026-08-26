<template>
    <div>
        <div>
            EMERALD
            <div v-for="owner in currentOwners.emeraldBroochOwners" :key="owner.internal_id">
                {{ owner.owner }} {{ owner.value }}
            </div>
        </div>
        <div>
            RUBY
            <div v-for="owner in currentOwners.rubyBroochOwners" :key="owner.internal_id">  
                {{ owner.owner }} {{ owner.value }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { querySubgraph } from "../utils/graphql"


const loading = ref(false)
const transferSingles = ref<any[]>([])

const BROOCH_UPGRADER = "0x46951e514b955e85846c21a1a722dd8426c9e25f"

const currentOwners = computed(() => {
    const emeraldBroochOwners: any[] = []
    const rubyBroochOwners: any[] = []

    const sortedTransferSingles = [...transferSingles.value].sort((a: any, b: any) => {
        if (Number(a.blockNumber) > Number(b.blockNumber)) {
            return 1
        } else if (Number(a.blockNumber) < Number(b.blockNumber)) {
            return -1
        } else {
            return 0
        }
    })

    for (const transfer of sortedTransferSingles) {
        // handle mints
        if (transfer.from === "0x0000000000000000000000000000000000000000") {
            if (transfer.internal_id === "0") {
                const owner = emeraldBroochOwners.find((x: any) => x.owner === transfer.to)
                if (owner) {
                    owner.value += 1
                } else {
                    emeraldBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            } else {
                const owner = rubyBroochOwners.find((x: any) => x.owner === transfer.to)
                if (owner) {
                    owner.value += 1
                } else {
                    rubyBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            }
        }
        
        // handle upgrades
        if (transfer.to === BROOCH_UPGRADER) {
            const owner = emeraldBroochOwners.find((x: any) => x.internal_id === transfer.internal_id && x.owner === transfer.from)
            if (owner) {
                owner.value -= 1
            }
        }

        // handle user transfers
        if (transfer.from !== "0x0000000000000000000000000000000000000000" && transfer.to !== BROOCH_UPGRADER) {
            if (transfer.internal_id === "0") {
                const owner = emeraldBroochOwners.find((x: any) => x.internal_id === transfer.internal_id && x.owner === transfer.from)
                if (owner) {
                    owner.value -= 1
                }

                const newOwner = emeraldBroochOwners.find((x: any) => x.owner === transfer.to)
                if (newOwner) {
                    newOwner.value += 1
                } else {
                    emeraldBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            } else {
                const owner = rubyBroochOwners.find((x: any) => x.internal_id === transfer.internal_id && x.owner === transfer.from)
                if (owner) {
                    owner.value -= 1
                }

                const newOwner = rubyBroochOwners.find((x: any) => x.owner === transfer.to)
                if (newOwner) {
                    newOwner.value += 1
                } else {
                    rubyBroochOwners.push({ owner: transfer.to, internal_id: transfer.internal_id, value: 1 })
                }
            }
        }
    }

    return { emeraldBroochOwners: emeraldBroochOwners.filter((x: any) => x.value > 0), rubyBroochOwners: rubyBroochOwners.filter((x: any) => x.value > 0) }
})

interface TransferSingle {
    internal_id: string
    blockNumber: string
    from: string
    to: string
    value: string
}

interface TransferSinglesData {
    transferSingles: TransferSingle[]
}

const GET_TRANSFERS = `
    query getTransfers($offset: Int) {
        transferSingles(skip: $offset) {
            internal_id
            blockNumber
            from
            to
            value
        }
    }
`

const loadTransfers = async () => {
    loading.value = true
    try {
        const transfers: TransferSingle[] = []
        while (true) {
            const data = await querySubgraph<
                TransferSinglesData,
                { offset: number }
            >(import.meta.env.VITE_SUBGRAPH_URL, GET_TRANSFERS, {
                offset: transfers.length,
            })
            const page = data.transferSingles
            transfers.push(...page)
            if (page.length === 0) {
                break
            }
        }
        transferSingles.value = transfers
    } catch (error) {
        console.error("Failed to load brooch transfers", error)
    } finally {
        loading.value = false
    }
}

onMounted(() => void loadTransfers())
</script>

