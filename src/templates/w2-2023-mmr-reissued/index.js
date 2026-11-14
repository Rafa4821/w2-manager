import { registerTemplate, setOriginalPdf, setPdfMapping } from '../engine/registry'
import manifest from './manifest.json'
import mapping from './mapping.json'
import pdfMapping from './pdfMapping.json'
import Template from './Template'
import templateCSS from './template.css?raw'
import originalPdf from './original-filled.pdf?url'

registerTemplate(manifest, mapping, Template, templateCSS)
setOriginalPdf(manifest.id, originalPdf)
setPdfMapping(manifest.id, pdfMapping)
