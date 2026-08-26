import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const abiDirectory = join(scriptDirectory, "../src/abi")
const outputDirectory = join(abiDirectory, "generated")

const functionsByContract = {
    bridge: ["sendPlayer"],
    brooch: [
        "balanceOf",
        "baseTokenPrice",
        "isApprovedForAll",
        "mintBatch",
        "setApprovalForAll",
        "tokenSupply",
    ],
    broochUpgrader: ["upgradeBrooch", "upgradePrices"],
    brush: ["approve", "transfer"],
    epProxy: ["getAllSavedTransactions", "isPaused"],
    estforPlayer: ["getActivePlayer", "processActions", "setActivePlayer", "startActions"],
    estforPlayerNFT: [
        "editPlayer",
        "isApprovedForAll",
        "mint",
        "safeTransferFrom",
        "setApprovalForAll",
    ],
    factoryRegistry: [
        "createProxy",
        "execute",
        "executeSavedTransactions",
        "multicall",
        "proxyAddressOfOwnerByIndex",
        "setPaused",
        "setTransaction",
        "totalAddressCount",
        "transactionCharge",
    ],
    itemNFT: ["safeBatchTransferFrom"],
    oldEstforPlayer: ["startActions"],
    petNFT: [],
}

const uniqueEntries = (entries) => {
    const seen = new Set()
    return entries.filter((entry) => {
        const key = JSON.stringify(entry)
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

export const generateCompactAbis = async () => {
    await mkdir(outputDirectory, { recursive: true })

    for (const [contract, functionNames] of Object.entries(functionsByContract)) {
        const source = JSON.parse(await readFile(join(abiDirectory, `${contract}.json`), "utf8"))
        const availableFunctions = new Set(
            source.filter((entry) => entry.type === "function").map((entry) => entry.name)
        )
        const missingFunctions = functionNames.filter((name) => !availableFunctions.has(name))
        if (missingFunctions.length > 0) {
            throw new Error(
                `${contract}.json is missing ABI functions: ${missingFunctions.join(", ")}`
            )
        }

        const selected = uniqueEntries(
            source.filter(
                (entry) =>
                    entry.type === "error" ||
                    (entry.type === "function" && functionNames.includes(entry.name))
            )
        )

        await writeFile(
            join(outputDirectory, `${contract}.json`),
            `${JSON.stringify(selected, null, 2)}\n`
        )
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateCompactAbis().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
