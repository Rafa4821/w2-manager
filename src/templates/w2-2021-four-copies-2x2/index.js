import { registerTemplate } from '../engine/registry'
import manifest from './manifest.json'
import mapping from './mapping.json'
import Template from './Template'

registerTemplate(manifest, mapping, Template, '')
