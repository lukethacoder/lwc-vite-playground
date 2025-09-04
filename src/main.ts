import { createElement } from 'lwc'
import '@lwc/synthetic-shadow'

import App from '../force-app/main/default/lwc/app/app'

document.body.querySelector('c-app')?.remove()

const elm = createElement('c-app', { is: App })
document.body.appendChild(elm)
