import { type Abi, decodeAbiParameters, decodeFunctionData, encodeFunctionData, parseAbiItem } from "viem"

type LooseAbi = Abi | readonly unknown[]

export const encode = (
    abi: LooseAbi,
    functionName: string,
    args?: readonly unknown[]
): `0x${string}` =>
    encodeFunctionData({
        abi: abi as Abi,
        functionName: functionName as never,
        args: (args ?? []) as never,
    })

export const decode = (data: any, _functionName?: string, abi?: LooseAbi) =>
    decodeFunctionData({
        abi: abi as Abi,
        data: data as `0x${string}`,
    }).args as any

const ITEM_REWARD_PARAMS = parseAbiItem(
    "function f(uint8 version, (uint16 itemTokenId, uint16 chance, uint16 amount)[] rewards)"
).inputs

const PET_RANGE_PARAMS = parseAbiItem(
    "function f(uint8 version, (uint16 rewardBasePetIdMin, uint16 rewardBasePetIdMax) petIds)"
).inputs

export const decodeItemRewards = (data: string): any =>
    decodeAbiParameters(
        ITEM_REWARD_PARAMS as never,
        data as `0x${string}`
    )[1] as any

export const decodePetRange = (data: string): any =>
    decodeAbiParameters(
        PET_RANGE_PARAMS as never,
        data as `0x${string}`
    )[1] as any
