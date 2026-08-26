import { copyFile, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Generated data files must not depend on ethers. instantVRFActions.ts is
// produced in the contracts repo with an ethers AbiCoder encoder; rewire it to
// the equivalent viem call when copying into src/.
async function copyInstantVRFActions() {
    let contents = await readFile(
        join(__dirname, "../estfor-contracts/scripts/data/instantVRFActions.ts"),
        "utf8"
    )
    contents = contents.replace(/^import \{ethers\} from "ethers";\r?\n/, "")
    contents = contents.replaceAll(
        "ethers.AbiCoder.defaultAbiCoder()",
        "abiCoder"
    )
    const shim = `
const ITEM_PARAMS = [
  {
    type: "uint8",
    name: "version",
  },
  {
    type: "tuple[]",
    components: [
      {
        type: "uint16",
        name: "itemTokenId",
      },
      {
        type: "uint16",
        name: "chance",
      },
      {
        type: "uint16",
        name: "amount",
      },
    ],
  },
] as const

const EGG_PARAMS = [
  {
    type: "uint8",
    name: "version",
  },
  {
    type: "tuple",
    components: [
      {
        type: "uint16",
        name: "rewardBasePetIdMin",
      },
      {
        type: "uint16",
        name: "rewardBasePetIdMax",
      },
    ],
  },
] as const

const abiCoder = {
  encode: (_types: string[], values: unknown[]): \`0x\${string}\` => {
    const params = _types[1]?.includes("rewardBasePetId") ? EGG_PARAMS : ITEM_PARAMS
    return encodeAbiParameters(params as never, values as never)
  },
}
`
    const bodyStart = contents.search(/^(?!import)/m)
    contents =
        `import { encodeAbiParameters } from "viem"\n` +
        contents.slice(0, bodyStart) +
        "\n" +
        shim +
        "\n" +
        contents.slice(bodyStart)
    await writeFile(
        join(__dirname, "../src/data/instantVRFActions.ts"),
        contents
    )
}

async function main() {
    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/actions.ts"),
        join(__dirname, "../src/data/actions.ts")
    )

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/items.ts"),
        join(__dirname, "../src/data/items.ts")
    )

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/actionChoices.ts"),
        join(__dirname, "../src/data/actionChoices.ts")
    )

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/fullAttireBonuses.ts"),
        join(__dirname, "../src/data/fullAttireBonuses.ts")
    )

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/actionChoiceIds.ts"),
        join(__dirname, "../src/data/actionChoiceIds.ts")
    )

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/pets.ts"),
        join(__dirname, "../src/data/pets.ts")
    )

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/passiveActions.ts"),
        join(__dirname, "../src/data/passiveActions.ts")
    )

    await copyInstantVRFActions()

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/quests.ts"),
        join(__dirname, "../src/data/quests.ts")
    )
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
