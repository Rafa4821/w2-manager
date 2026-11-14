import { registerTemplate, setPdfBase } from '../engine/registry'
import manifest from './manifest.json'
import mapping from './mapping.json'
import Template from './Template'
import templateCSS from './template.css?raw'
import blankBasePdf from './blank-base.pdf?url'

registerTemplate(manifest, mapping, Template, templateCSS)
setPdfBase(manifest.id, blankBasePdf)
