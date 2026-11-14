import { registerTemplate } from '../engine/registry'
import manifest from './manifest.json'
import mapping from './mapping.json'
import DemoW2Template from './Template'
import templateCSS from './template.css?raw'

registerTemplate(manifest, mapping, DemoW2Template, templateCSS)
