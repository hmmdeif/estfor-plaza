import { getAccount, readContract, writeContract } from "@wagmi/core"
import { defineStore } from "pinia"
import {
    HOMEMADE_BROOCH_ADDRESS,
    BROOCH_UPGRADER_ADDRESS,
} from "../utils/addresses"
import broochAbi from "../abi/brooch.json"
import broochUpgraderAbi from "../abi/broochUpgrader.json"
import { solidityPacked } from "ethers"
import { config, SONIC_CHAIN_ID } from "../config"

export interface Brooch {
    tokenId: number
    balance: number
    totalSupply: number
    baseTokenPrice: number
}

export interface BroochState {
    brooches: Brooch[]
}

export const useBroochStore = defineStore("brooch", {
    state: () =>
        ({
            brooches: [] as Brooch[],
        }) as BroochState,
    getters: {
        brooch(state: BroochState) {
            return (tokenId: number) => {
                return (
                    state.brooches.find((x) => x.tokenId == tokenId) || {
                        tokenId,
                        balance: 0,
                        totalSupply: 0,
                        baseTokenPrice: 0,
                    }
                )
            }
        },
        hasAccess(state: BroochState) {
            const maxTokenId = Math.max(...state.brooches.map((x) => x.tokenId))
            return (tokenId: number) => {
                let hasBrooch = false
                for (let i = tokenId; i <= maxTokenId; i++) {
                    const brooch = state.brooches.find((x) => x.tokenId == i)
                    if ((brooch?.balance || 0) > 0) {
                        hasBrooch = true
                    }
                }
                return hasBrooch
            }
        },
    },
    actions: {
        disconnect() {
            this.brooches = []
        },
        async getBroochData(tokenId: number, isUpgrade: boolean) {
            const account = getAccount(config)
            if (!account.isConnected) return

            let result: any[] = []
            if (!isUpgrade) {
                result = await Promise.all([
                    readContract(config, {
                        address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                        abi: broochAbi,
                        functionName: "tokenSupply",
                        args: [tokenId],
                        chainId: SONIC_CHAIN_ID,
                    }),
                    readContract(config, {
                        address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                        abi: broochAbi,
                        functionName: "baseTokenPrice",
                        args: [tokenId],
                        chainId: SONIC_CHAIN_ID,
                    }),
                    readContract(config, {
                        address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                        abi: broochAbi,
                        functionName: "balanceOf",
                        args: [account.address, tokenId],
                        chainId: SONIC_CHAIN_ID,
                    }),
                ])
            } else {
                result = await Promise.all([
                    readContract(config, {
                        address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                        abi: broochAbi,
                        functionName: "tokenSupply",
                        args: [tokenId],
                        chainId: SONIC_CHAIN_ID,
                    }),
                    readContract(config, {
                        address: BROOCH_UPGRADER_ADDRESS as `0x${string}`,
                        abi: broochUpgraderAbi,
                        functionName: "upgradePrices",
                        args: [tokenId],
                        chainId: SONIC_CHAIN_ID,
                    }),
                    readContract(config, {
                        address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                        abi: broochAbi,
                        functionName: "balanceOf",
                        args: [account.address, tokenId],
                        chainId: SONIC_CHAIN_ID,
                    }),
                ])
            }
            let brooch = this.brooches.find((x) => x.tokenId == tokenId)
            if (!brooch) {
                brooch = {
                    tokenId,
                    balance: 0,
                    totalSupply: 0,
                    baseTokenPrice: 0,
                }
                this.brooches.push(brooch)
            }
            brooch.totalSupply = parseInt(
                (result[0] as unknown as bigint).toString(),
                10
            )
            brooch.baseTokenPrice = parseInt(
                (result[1] as unknown as bigint).toString(),
                10
            )
            brooch.balance = parseInt(
                (result[2] as unknown as bigint).toString(),
                10
            )
        },
        mintNFT(tokenId: number) {
            const account = getAccount(config)
            return writeContract(config, {
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: "mintBatch",
                chainId: SONIC_CHAIN_ID,
                args: [
                    account.address,
                    [0],
                    [1],
                    solidityPacked(["bytes"], ["0x"]),
                ],
                value:
                    BigInt(this.brooches[tokenId]?.totalSupply) *
                        BigInt(10 ** 18) +
                    BigInt(this.brooches[tokenId]?.baseTokenPrice),
            })
        },
        setApprovalForAll() {
            return writeContract(config, {
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: "setApprovalForAll",
                args: [BROOCH_UPGRADER_ADDRESS, true],
                chainId: SONIC_CHAIN_ID,
            })
        },
        upgradeBrooch(tokenId: number) {
            return writeContract(config, {
                address: BROOCH_UPGRADER_ADDRESS as `0x${string}`,
                abi: broochUpgraderAbi,
                functionName: "upgradeBrooch",
                args: [tokenId],
                chainId: SONIC_CHAIN_ID,
                value:
                    BigInt(this.brooches[tokenId]?.totalSupply) *
                        BigInt(10 ** 18) +
                    BigInt(this.brooches[tokenId]?.baseTokenPrice),
            })
        },
        getApproval() {
            const account = getAccount(config)
            return readContract(config, {
                address: HOMEMADE_BROOCH_ADDRESS as `0x${string}`,
                abi: broochAbi,
                functionName: "isApprovedForAll",
                args: [account.address, BROOCH_UPGRADER_ADDRESS],
                chainId: SONIC_CHAIN_ID,
            })
        },
    },
})
