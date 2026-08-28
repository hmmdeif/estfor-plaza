export interface FactorySyncEligibility {
    playerId: string
    playerOwner?: string
    accountAddress?: string
}

export const canSyncFactorySilos = ({
    playerId,
    playerOwner,
    accountAddress,
}: FactorySyncEligibility): boolean =>
    playerId !== "0" &&
    !!playerOwner &&
    !!accountAddress &&
    playerOwner.toLowerCase() === accountAddress.toLowerCase()
