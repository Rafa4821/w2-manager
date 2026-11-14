export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getDefaultTemplate,
  getTemplatesForYear,
  hasTemplates,
  unregisterTemplate,
  clearRegistry,
  setPdfBase,
  getPdfBase,
} from './registry'

export {
  mapDocumentToTemplate,
  getRequiredFields,
  getMissingFields,
} from './fieldMapper'

export { TemplateRenderer, TemplatePrintRoot } from './TemplateRenderer'

export { adaptDocumentForTemplate } from './documentAdapter'
