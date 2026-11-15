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

// Production templates — rebuilt from originals as pure HTML/CSS + vector PDF
import './w2-2021-three-copies'      // Plantilla 1
import './w2-2021-four-copies-2x2'   // Plantilla 2

// Re-export the engine for convenience
export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getDefaultTemplate,
  getTemplatesForYear,
  hasTemplates,
  setPdfBase,
  getPdfBase,
  setOriginalPdf,
  getOriginalPdf,
  setPdfMapping,
  getPdfMapping,
  setBackgroundImages,
  getBackgroundImages,
  TemplateRenderer,
  TemplatePrintRoot,
  mapDocumentToTemplate,
  getRequiredFields,
  getMissingFields,
  adaptDocumentForTemplate,
} from './engine'
