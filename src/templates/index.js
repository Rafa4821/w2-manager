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

// Built-in demo template
import './demo-w2'

// Production templates — organized by tax year
import './w2-2021-three-copies'
import './w2-2021-earnings-four-copies'
import './w2-2021-mcdean-state-pages'
import './w2-2022-four-copies'
import './w2-2022-industrial-four-copies'
import './w2-2023-adp-earnings'
import './w2-2023-mmr-reissued'
import './w2-2024-four-stacked'
import './w2-2025-three-stacked'

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
  TemplateRenderer,
  TemplatePrintRoot,
  mapDocumentToTemplate,
  getRequiredFields,
  getMissingFields,
  adaptDocumentForTemplate,
} from './engine'
