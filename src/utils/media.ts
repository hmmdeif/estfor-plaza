// Media asset filenames are normalised to lower case without extension.
const assetKey = (name: string) => name.replace(/\.jpe?g$/i, "").toLowerCase()

const joinSrcSet = (url1x?: string, url2x?: string): string | undefined => {
    if (!url1x) {
        return undefined
    }
    return url2x ? `${url1x} 1x, ${url2x} 2x` : url1x
}

export interface PictureSources {
    fallback?: string
    webp?: string
    avif?: string
}

type AssetModules = Record<string, { default: string }>

const indexAssets = (modules: AssetModules) => {
    const index = new Map<string, string>()
    for (const [path, mod] of Object.entries(modules)) {
        const file = path.replace(/^.*\//, "")
        index.set(file, mod.default)
    }
    return index
}

// Monsters are stored as <name>-96.webp thumbnails and -960.webp/.avif full images.
const monsterThumbs = indexAssets(
    import.meta.glob("../assets/optimized/monster/*-96.webp", { eager: true })
)
const monsterWebp = indexAssets(
    import.meta.glob("../assets/optimized/monster/*-960.webp", { eager: true })
)
const monsterAvif = indexAssets(
    import.meta.glob("../assets/optimized/monster/*-960.avif", { eager: true })
)

export const monsterThumbSource = (name: string): string | undefined =>
    monsterThumbs.get(`${assetKey(name)}-96.webp`)

export const monsterImage = (name: string): PictureSources => ({
    avif: monsterAvif.get(`${assetKey(name)}-960.avif`),
    fallback: monsterWebp.get(`${assetKey(name)}-960.webp`),
})

// Characters are stored as <id>-96.webp thumbnails and -1024.webp/.avif full images.
const characterThumbs = indexAssets(
    import.meta.glob("../assets/optimized/character/*-96.webp", { eager: true })
)
const characterWebp = indexAssets(
    import.meta.glob("../assets/optimized/character/*-1024.webp", {
        eager: true,
    })
)
const characterAvif = indexAssets(
    import.meta.glob("../assets/optimized/character/*-1024.avif", {
        eager: true,
    })
)

export const characterThumbSource = (id: string | number): string | undefined =>
    characterThumbs.get(`${assetKey(String(id))}-96.webp`)

export const characterImage = (id: string | number): PictureSources => ({
    avif: characterAvif.get(`${assetKey(String(id))}-1024.avif`),
    fallback: characterWebp.get(`${assetKey(String(id))}-1024.webp`),
})

// Landscape backgrounds are stored as <name>-960 and <name>-1920 in .webp/.avif.
const landscapeWebp = indexAssets(
    import.meta.glob("../assets/optimized/background/*.webp", { eager: true })
)
const landscapeAvif = indexAssets(
    import.meta.glob("../assets/optimized/background/*.avif", { eager: true })
)

export const landscapeImage = (name: string): PictureSources => {
    const webp = joinSrcSet(
        landscapeWebp.get(`${assetKey(name)}-960.webp`),
        landscapeWebp.get(`${assetKey(name)}-1920.webp`)
    )
    const avif = joinSrcSet(
        landscapeAvif.get(`${assetKey(name)}-960.avif`),
        landscapeAvif.get(`${assetKey(name)}-1920.avif`)
    )
    return {
        fallback: landscapeWebp.get(`${assetKey(name)}-960.webp`),
        webp,
        avif,
    }
}
