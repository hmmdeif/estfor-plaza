import { copyFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/instantVRFActions.ts"),
        join(__dirname, "../src/data/instantVRFActions.ts")
    )

    await copyFile(
        join(__dirname, "../estfor-contracts/scripts/data/quests.ts"),
        join(__dirname, "../src/data/quests.ts")
    )
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
