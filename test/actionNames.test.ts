import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { runInNewContext } from "node:vm"
import { EstforConstants } from "@paintswap/estfor-definitions"
import * as choiceIds from "../src/data/actionChoiceIds.ts"

const source = readFileSync(new URL("../src/store/skills.ts", import.meta.url), "utf8")

// Evaluate the actual label tables without loading wallet/browser store dependencies.
function readNames(name: string): Record<number, string> {
    const match = source.match(new RegExp(`export const ${name} = (\\{[\\s\\S]*?\\n\\})`))
    assert.ok(match, `Missing ${name} table`)
    return runInNewContext(`(${match[1]})`, { EstforConstants })
}

const actionNames = readNames("actionNames")
const actionChoiceNames = readNames("actionChoiceNames")
const constants = EstforConstants as unknown as Record<string, number>

for (const [group, ids] of Object.entries(choiceIds)) {
    test(`${group}: every choice has a nonblank label`, () => {
        const missing = ids.filter((id) => !actionChoiceNames[id]?.trim())
        assert.deepEqual(
            missing,
            [],
            `Missing labels: ${missing
                .map((id) =>
                    Object.keys(constants).find(
                        (key) => key.startsWith("ACTIONCHOICE_") && constants[key] === id
                    )
                )
                .join(", ")}`
        )
    })
}

test("every action has a label, except generic recipe actions", () => {
    const actions = readFileSync(new URL("../src/data/actions.ts", import.meta.url), "utf8")
    const genericActions = new Set([
        "ACTION_FIREMAKING_ITEM",
        "ACTION_SMITHING_ITEM",
        "ACTION_COOKING_ITEM",
        "ACTION_CRAFTING_ITEM",
        "ACTION_FLETCHING_ITEM",
        "ACTION_ALCHEMY_ITEM",
        "ACTION_FORGING_ITEM",
    ])
    const ids = [...actions.matchAll(/actionId: EstforConstants\.(\w+)/g)].map((match) => match[1])
    assert.ok(ids.length > 0)
    assert.deepEqual(
        ids.filter((id) => !genericActions.has(id) && !actionNames[constants[id]]?.trim()),
        []
    )

    // These must remain unnamed: summaries prefer the action label over the recipe label.
    for (const id of genericActions) {
        assert.equal(actionNames[constants[id]], undefined, id)
    }
})
