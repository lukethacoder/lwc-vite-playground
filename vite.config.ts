import type { UserConfig } from 'vite'
import lwc from './vite-plugin-lwc'

import LWC_CONFIG from './lwc.config.json'

export default {
  plugins: [
    lwc({
      rootDir: './',
      exclude: [
        /^__vite-optional-peer-dep:/,
        /node_modules/,
        /iframe\.html/,
        /index\.html/,
        './**/*.(mdx|json|map|stories.ts|tsx)',
      ],
      modules: LWC_CONFIG.modules,
      // disableSyntheticShadowSupport: true,
      disableSyntheticShadowSupport: false,
      // experimentalDynamicDirective: true,
      enableDynamicComponents: true,
      // allows using `await import()` with non-strict strings (dynamic values)
      // experimentalDynamicComponent: {
      //   // loader: '@salesforce/loader',
      //   strictSpecifier: false,
      // },
    }),
  ],
} satisfies UserConfig
