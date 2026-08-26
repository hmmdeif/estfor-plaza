import {
    type Abi,
    decodeAbiParameters,
    decodeErrorResult,
    parseAbiParameters,
} from "viem"

import bridgeAbi from "../abi/bridge.json"
import broochAbi from "../abi/brooch.json"
import broochUpgraderAbi from "../abi/broochUpgrader.json"
import brushAbi from "../abi/brush.json"
import epProxyAbi from "../abi/epProxy.json"
import estforPlayerAbi from "../abi/estforPlayer.json"
import estforPlayerNFTAbi from "../abi/estforPlayerNFT.json"
import factoryRegistryAbi from "../abi/factoryRegistry.json"
import itemNFTAbi from "../abi/itemNFT.json"
import oldEstforPlayerAbi from "../abi/oldEstforPlayer.json"
import petNFTAbi from "../abi/petNFT.json"

const allErrors = [
    bridgeAbi,
    broochAbi,
    broochUpgraderAbi,
    brushAbi,
    epProxyAbi,
    estforPlayerAbi,
    estforPlayerNFTAbi,
    factoryRegistryAbi,
    itemNFTAbi,
    oldEstforPlayerAbi,
    petNFTAbi,
].flat() as Abi

const stringParams = parseAbiParameters("string")
const uint256Params = parseAbiParameters("uint256")

const formatArgs = (args: unknown): string =>
    Array.isArray(args)
        ? args.map((a) => (typeof a === "bigint" ? `${a}n` : String(a))).join(", ")
        : JSON.stringify(args)

const decodeRawRevert = (data: `0x${string}`): string => {
    try {
        const result = decodeErrorResult({ abi: allErrors, data })
        return `reverted ${result.errorName}(${
            result.args === undefined ? "" : formatArgs(result.args)
        })`
    } catch {
        // no matching ABI entry - viem has no built-in selector registry lookup
        const selector = data.slice(0, 10)
        const customData = `0x${data.slice(10)}`
        switch (selector) {
            case "0x08c379a0": {
                const [reason] = decodeAbiParameters(
                    stringParams,
                    customData as `0x${string}`
                )
                return `reverted "${reason}"`
            }
            case "0x4e487b71": {
                const [code] = decodeAbiParameters(
                    uint256Params,
                    customData as `0x${string}`
                )
                return `panicked with code ${code}`
            }
            default:
                return `reverted with unknown error selector ${selector}`
        }
    }
}

// Builds a diagnosis-friendly summary from an ethers/viem/wagmi error chain by
// walking `cause` links and decoding revert data wherever it can be found.
export const describeTxError = (error: unknown): string => {
    const lines: string[] = []
    let err = error as any
    let depth = 0
    while (err && depth < 10) {
        const parts: string[] = []
        if (err.name && err.name !== "Error") {
            parts.push(err.name)
        }
        if (err.data?.errorName !== undefined) {
            parts.push(
                `reverted ${err.data.errorName}(${formatArgs(err.data.args)})`
            )
        } else {
            const raw =
                typeof err.raw === "string" && err.raw.startsWith("0x")
                    ? err.raw
                    : typeof err.raw?.data === "string" &&
                        err.raw.data.startsWith("0x")
                      ? err.raw.data
                      : typeof err.data === "string" &&
                          err.data.startsWith("0x") &&
                          err.data.length >= 10
                        ? err.data
                      : undefined
            if (raw) {
                parts.push(decodeRawRevert(raw as `0x${string}`))
            }
        }
        if (typeof err.functionName === "string") {
            parts.push(`in call to ${err.functionName}()`)
        }

        const extra =
            err.reason ||
            err.details?.split("\n")[0] ||
            err.shortMessage?.split("\n")[0]
        if (parts.length > 0 || extra) {
            lines.push([...parts.filter(Boolean), extra].filter(Boolean).join(" – "))
        }
        err = err.cause
        depth++
    }
    return lines.length > 0
        ? lines.join("\n  caused by ")
        : String(error)
}
