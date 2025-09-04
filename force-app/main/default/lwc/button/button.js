import { LightningElement, api } from 'lwc'
// import sanitizeHTML from 'c/purifyLibrary'

export default class Button extends LightningElement {
  @api
  get label() {
    return this._label || 'Label'
  }
  set label(value) {
    this._label = value
  }

  _label

  handleOnClick() {
    console.log('handleOnClick')
    // console.log(
    //   `sanitizing HTML from purifyLibrary `,
    //   sanitizeHTML(`sanitizeHTML('<img src=x onerror=alert(1)//>')`)
    // )
  }
}
