/**
 * Edited version of the `vite-plugin-lwc` plugin
 *
 * @see https://github.com/cardoso/vite-plugin-lwc
 */
import patch from './patch.ts'
import lwc from './lwc.ts'
import alias from './alias.ts'
import type { Plugin } from 'vite'
import hmr from './hmr.ts'
import type { ViteLwcOptions } from './types.ts'
import { normalizeOptions } from './options.ts'

// taken from `@lwc/rollup-plugin`
const IMPLICIT_DEFAULT_HTML_PATH = '@lwc/resources/empty_html.js'
const IMPLICIT_DEFAULT_CSS_PATH = '@lwc/resources/empty_css.css'

function transformOverride(transform, viteOptions) {
  const moduleDirs = viteOptions.modules?.reduce((acc, item) => {
    if (item.dir) {
      acc.push(item.dir)
    }
    if (item.dirs) {
      acc.push(...item.dirs)
    }

    return acc
  }, [])

  return {
    ...transform,
    filter: transform.filter,
    async handler(code, id, options) {
      if (isLwcCss(id, moduleDirs)) {
        /**
         * These imports are handled by the LWC engine and
         * should be ignored by `vite:css`/`vite:css-post`.
         */
        return undefined
      } else {
        return transform.handler?.call(this, code, id, options)
      }
    },
  }
}

/**
 * Poor mans "is LWC" check. Based on LWC module dir|dirs config passed
 * to the plugin.
 *
 * @param {string} id - Id path to check
 * @param {string[]} moduleDirs - list of module directories (from dir|dirs config)
 * @returns {boolean}
 */
const isInModuleDirs = (id: string, moduleDirs: string[]) => {
  // loop until a match is found (or fail through all matches)
  for (const moduleDir of moduleDirs) {
    // removes the `./` from the prefix so the full path of id matches
    const dirPath = moduleDir.replace('./', '/')

    if (id.includes(dirPath)) {
      return true
    }
  }

  return false
}

const isLwcCss = (id: string, moduleDirs: string[]) => {
  // should handle '@lwc/resources/empty_html.css' & '@lwc/resources/empty_css.css'
  if (
    isInModuleDirs(id, moduleDirs) ||
    id.startsWith('c/') ||
    id.includes(IMPLICIT_DEFAULT_HTML_PATH) ||
    id.includes(IMPLICIT_DEFAULT_CSS_PATH)
  ) {
    // console.log('✅ IS LWC IMPORT, handling properly ', { id })
    return true
  }

  // console.log('❌ ingore non-LWC CSS import ', { id })
  // continue with standard Vite CSS processing
  return false
}

export default (options: ViteLwcOptions = {}): Plugin[] => {
  options = normalizeOptions(options)

  return [
    patch({
      'vite:css': (p) => {
        p.transform = transformOverride(p.transform, options)
      },
      'vite:css-post': (p) => {
        p.transform = transformOverride(p.transform, options)
      },
    }),
    alias(),
    {
      ...lwc(options),
      apply: 'build',
    },
    {
      ...lwc(options),
      enforce: 'post',
      apply: 'serve',
    },
    hmr(),
  ]
}
