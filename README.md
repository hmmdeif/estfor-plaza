# Estfor Plaza

## Install

`pnpm i`

## Run

Copy Estfor data locally from the submodule repo `pnpm run build:scripts`

`pnpm run dev`

## Amp orbs

`.agents/setup` prepares Node.js >=24, the pnpm version pinned in `package.json`,
the committed contracts submodule, locked dependencies, and generated application
data. Amp caches this environment for fresh orbs. Repeated setup runs reuse the
installed dependencies. `.agents/resume` does not reinstall them.

Run `pnpm test` and `pnpm build` to check the prepared environment. No local
database is required. Wallet connections require `VITE_PROJECT_ID`; configure it
in the orb environment rather than adding credentials to setup or the snapshot.
