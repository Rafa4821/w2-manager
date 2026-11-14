export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getDefaultTemplate,
  getTemplatesForYear,
  hasTemplates,
  unregisterTemplate,
  clearRegistry,
} from './registry'

export {
  mapDocumentToTemplate,
  getRequiredFields,
  getMissingFields,
} from './fieldMapper'

export { TemplateRenderer, TemplatePrintRoot } from './TemplateRenderer'

export { adaptDocumentForTemplate } from './documentAdapter'
