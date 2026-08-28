/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_PROJECT_ID: string
    readonly VITE_SUBGRAPH_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
