import assert from "node:assert/strict"
import { test } from "node:test"

import { canSyncFactorySilos } from "../src/utils/factorySync.ts"

const PREVIOUS_WALLET = "0x1111111111111111111111111111111111111111"
const CURRENT_WALLET = "0x2222222222222222222222222222222222222222"

test("does not sync when the active hero belongs to the previous wallet", () => {
    assert.equal(
        canSyncFactorySilos({
            playerId: "42",
            playerOwner: PREVIOUS_WALLET,
            accountAddress: CURRENT_WALLET,
        }),
        false
    )
})

test("syncs when the active hero belongs to the current wallet", () => {
    assert.equal(
        canSyncFactorySilos({
            playerId: "42",
            playerOwner: CURRENT_WALLET,
            accountAddress: CURRENT_WALLET,
        }),
        true
    )
})

test("does not sync without an active hero", () => {
    assert.equal(
        canSyncFactorySilos({
            playerId: "0",
            playerOwner: CURRENT_WALLET,
            accountAddress: CURRENT_WALLET,
        }),
        false
    )
})
