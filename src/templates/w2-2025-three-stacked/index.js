import { registerTemplate, setPdfBase, setBackgroundImages } from '../engine/registry'
import manifest from './manifest.json'
import mapping from './mapping.json'
import Template from './Template'
import templateCSS from './template.css?raw'
import blankBasePdf from './blank-base.pdf?url'
import bg from './blank-background-page-1.png'

registerTemplate(manifest, mapping, Template, templateCSS)
setPdfBase(manifest.id, blankBasePdf)
setBackgroundImages(manifest.id, [bg])
