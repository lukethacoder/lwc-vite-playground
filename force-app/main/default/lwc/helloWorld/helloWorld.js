import { LightningElement, api } from 'lwc'
import BaseClass from 'c/baseClass'

import { add } from 'c/utils'

export default class HelloWorld extends BaseClass {
  @api
  msg = 'Hello, World!!'

  count = 4

  customLwc = 'c/importMe'
  customLwcCtor

  async handleClick() {
    console.log('add ', add(1, 2))
    this.count += 2
    try {
      const { default: ctor } = await import('c/importMe')
      console.log('dynamically importing this - ', ctor)
      this.customLwcCtor = ctor
    } catch (error) {
      console.error(`Unable to find custom LWC "${this.customLwc}" `, error)
    }
  }
}
