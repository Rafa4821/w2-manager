/**
 * Template Registry Bootstrap
 *
 * Import this file once (in App.jsx or main.jsx) to register all
 * built-in templates. Each template folder has its own index.js
 * that calls registerTemplate() on import.
 *
 * To add a new template:
 *   1. Create src/templates/<your-template>/
 *   2. Add manifest.json, mapping.json, Template.jsx, template.css
 *   3. Add an index.js that imports & registers them
 *   4. Import that index.js here
 */

// Built-in templates
import './demo-w2'

// Re-export the engine for convenience
export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getDefaultTemplate,
  getTemplatesForYear,
  hasTemplates,
  TemplateRenderer,
  TemplatePrintRoot,
  mapDocumentToTemplate,
  getRequiredFields,
  getMissingFields,
  adaptDocumentForTemplate,
} from './engine'
