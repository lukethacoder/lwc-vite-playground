import { LightningElement } from 'lwc'

export default class BaseClass extends LightningElement {
  renderedCallback() {
    console.log('hello world (from BaseClass)')
  }
}
