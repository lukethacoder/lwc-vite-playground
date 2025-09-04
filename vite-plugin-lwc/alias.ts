import type { AliasOptions, Plugin } from 'vite'

const alias: AliasOptions = [
  // {
  //   // Find all html imports and add ?import to the end of the import
  //   find: /^(?!.*index)(.*)\.html$/,
  //   replacement: '$1.html?import',
  // },
  {
    /**
     * Find all html imports and add ?import to the end of
     * the import, ignoring `iframe.html` and any `@storybook` imports?
     */
    find: /^(?!.*index)(?!.*iframe\.html$)(.*)\.html$/,
    // find: /^(?!.*[\/\\]@storybook[\/\\])(?!.*index)(?!.*iframe\.html(\?|$))(.*)\.html(\?|$)/,
    replacement: '$1.html?import',
    // replacement: (match, p1) => {
    //   console.log(`Transforming: ${match} → ${p1}.html?import`)
    //   return `${p1}.html?import`
    //   // `${p1}.html?import`
    // },
  },
]

export default function lwcAliasPlugin(): Plugin {
  return {
    name: 'lwc:alias',
    enforce: 'pre',
    apply: 'build',
    config() {
      return {
        resolve: {
          alias,
        },
      }
    },
  }
}
