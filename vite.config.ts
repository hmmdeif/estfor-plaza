import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const require = createRequire(import.meta.url)
const estforConstants = require('@paintswap/estfor-definitions/constants') as Record<
  string,
  unknown
>

const ESTFOR_DEFINITIONS_IMPORT =
  /import\s*\{([^}]*)\}\s*from\s*['"]@paintswap\/estfor-definitions['"];?\s*/g

const literalEstforConstants = (): Plugin => ({
  name: 'literal-estfor-constants',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('/src/') || !/\.(?:ts|vue)$/.test(id)) return

    let transformed = code.replace(
      /EstforConstants\.([A-Z][A-Z0-9_]*)/g,
      (reference, name: string) => {
        const value = estforConstants[name]
        return typeof value === 'number' || typeof value === 'string'
          ? JSON.stringify(value)
          : reference
      },
    )

    if (!/EstforConstants\./.test(transformed)) {
      transformed = transformed.replace(
        ESTFOR_DEFINITIONS_IMPORT,
        (statement, imports: string) => {
          const importedNames = imports
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
          const remainingImports = importedNames.filter((name) => name !== 'EstforConstants')

          if (remainingImports.length === importedNames.length) return statement

          return remainingImports.length > 0
            ? `import { ${remainingImports.join(', ')} } from '@paintswap/estfor-definitions'\n`
            : ''
        },
      )
    }

    return transformed === code ? undefined : transformed
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [literalEstforConstants(), tailwindcss(), vue()],
  base: process.env.NODE_ENV === 'production' ? '/estfor-plaza/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
