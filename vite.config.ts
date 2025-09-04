import type { UserConfig } from 'vite'
import lwc from './vite-plugin-lwc'

export default {
  plugins: [
    lwc({
      rootDir: './',
      modules: [
        {
          dir: './force-app/main/default/lwc',
          namespace: 'c',
        },
      ],
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
