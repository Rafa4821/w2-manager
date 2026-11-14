# Template Engine — Developer Guide

## Architecture Overview

The template engine lives in `src/templates/` and is fully decoupled from the W-2 editor and PDF generator. It has three layers:

```
src/templates/
├── engine/                    # Core engine (do not modify)
│   ├── registry.js            # Template catalog & validation
│   ├── fieldMapper.js         # Maps document data → template fields
│   ├── TemplateRenderer.jsx   # Renders at real page dimensions with scaling
│   └── index.js               # Public API
├── demo-w2/                   # Built-in demo template
│   ├── manifest.json          # Metadata & page config
│   ├── mapping.json           # Field mapping definitions
│   ├── Template.jsx           # React component
│   ├── template.css           # Scoped styles
│   └── index.js               # Self-registration
├── index.js                   # Bootstrap — imports all templates
└── (your-template)/           # Add new templates here
```

## How to Add a New Template

### 1. Create the folder

```
src/templates/my-template/
├── manifest.json
├── mapping.json
├── Template.jsx
├── template.css
└── index.js
```

### 2. Write `manifest.json`

```json
{
  "id": "my-template",
  "name": "My Custom Template",
  "description": "Short description of what this template is.",
  "version": "1.0.0",
  "author": "Your Name",
  "category": "standard",
  "taxYears": [2023, 2024, 2025],
  "pages": 1,
  "pageSize": {
    "width": 8.5,
    "height": 11,
    "unit": "in"
  },
  "isDefault": false
}
```

**Required fields:** `id`, `name`, `version`, `category`

**Page size:** Set `width` and `height` in the specified `unit` (`"in"`, `"mm"`, or `"cm"`). The renderer converts to CSS pixels at 96 DPI.

**Multi-page:** Set `pages` to the number of pages. Your component receives `page` (1-based) and `totalPages` as props.

**Tax years:** If empty or omitted, the template is available for all years.

### 3. Write `mapping.json`

Maps template field IDs to paths in the W-2 document object:

```json
{
  "fields": {
    "employeeSSN": {
      "path": "employeeSnapshot.ssn",
      "type": "text",
      "label": "Employee SSN",
      "required": true
    },
    "box1": {
      "path": "box1_wagesTips",
      "type": "currency",
      "label": "Box 1 — Wages"
    },
    "box12": {
      "path": "box12",
      "type": "array",
      "label": "Box 12 Entries"
    },
    "box13_retirement": {
      "path": "box13_retirementPlan",
      "type": "boolean",
      "label": "Retirement Plan"
    }
  }
}
```

**Field types:**
| Type       | Description                         | Output                |
|------------|-------------------------------------|-----------------------|
| `text`     | String value                        | `String(value)`       |
| `currency` | Number formatted as USD             | `$75,000.00`          |
| `number`   | Raw number                          | `75000`               |
| `boolean`  | Checkbox/flag                       | `true` / `false`      |
| `array`    | Array (box12, box14, stateLocal)    | `[{...}, ...]`        |

**Optional properties:**
- `required: true` — marks the field as needed for validation
- `format: "uppercase"` — transforms text to uppercase
- `label` — human-readable name for validation messages

**Available document paths:**

```
companySnapshot.name, .ein, .address, .address2, .city, .state, .zipCode, .stateEmployerId
employeeSnapshot.firstName, .middleInitial, .lastName, .suffix, .ssn, .address, .address2, .city, .state, .zipCode
taxYear, controlNumber, templateId
box1_wagesTips, box2_federalTaxWithheld, box3_socialSecurityWages, box4_socialSecurityTax
box5_medicareWages, box6_medicareTax, box7_socialSecurityTips, box8_allocatedTips
box10_dependentCareBenefits, box11_nonqualifiedPlans
box12[0].code, box12[0].amount (up to [3])
box13_statutoryEmployee, box13_retirementPlan, box13_thirdPartySickPay
box14[N].description, box14[N].amount
stateLocal[N].state, .employerStateId, .stateWages, .stateTax, .localWages, .localTax, .localityName
status, notes, createdAt, updatedAt
```

### 4. Write `Template.jsx`

```jsx
export default function MyTemplate({ data, doc, page, totalPages, manifest }) {
  // `data`  — mapped fields from mapping.json (already formatted)
  // `doc`   — raw W-2 document (for anything not in mapping)
  // `page`  — current page number (1-based)
  // `totalPages` — total pages
  // `manifest`   — this template's manifest.json

  return (
    <div>
      {/* Your template layout here */}
      <p>{data.employerName}</p>
      <p>{data.box1}</p>
    </div>
  )
}
```

### 5. Write `template.css`

**Important:** Scope ALL styles using the `data-template-id` attribute to avoid conflicts:

```css
[data-template-id="my-template"] {
  font-family: 'Courier New', monospace;
  padding: 24px;
}

[data-template-id="my-template"] .my-field {
  border: 1px solid #000;
  padding: 4px;
}
```

The CSS is injected as a `<style>` tag when the template renders. Using the `[data-template-id]` selector ensures complete style isolation.

### 6. Write `index.js`

```js
import { registerTemplate } from '../engine/registry'
import manifest from './manifest.json'
import mapping from './mapping.json'
import MyTemplate from './Template'
import templateCSS from './template.css?raw'

registerTemplate(manifest, mapping, MyTemplate, templateCSS)
```

Note: `?raw` imports the CSS as a plain string (Vite feature).

### 7. Register in `src/templates/index.js`

Add one line:

```js
import './my-template'
```

That's it. The template will appear in the editor's template selection step and the Template Library page.

---

## Engine API

### Registry

```js
import { registerTemplate, getTemplate, getAllTemplates, getTemplatesForYear } from './templates'

registerTemplate(manifest, mapping, Component, cssString)
getTemplate('demo-w2')           // → { manifest, mapping, component, css }
getAllTemplates()                 // → [ ... ]
getTemplatesForYear(2024)        // → templates whose taxYears include 2024
```

### Field Mapper

```js
import { mapDocumentToTemplate, getRequiredFields, getMissingFields } from './templates'

const mapped = mapDocumentToTemplate(doc, template.mapping)
const required = getRequiredFields(template.mapping)
const missing = getMissingFields(doc, template.mapping)
```

### Renderer

```jsx
import { TemplateRenderer, TemplatePrintRoot } from './templates'

// Screen preview with auto-scaling to container width
<TemplateRenderer templateId="demo-w2" doc={document} />

// Manual scale (e.g. 50%)
<TemplateRenderer templateId="demo-w2" doc={document} scale={0.5} />

// Full-size for PDF capture (no scaling, page breaks between pages)
<TemplatePrintRoot templateId="demo-w2" doc={document} />
```

---

## Visualization vs PDF Generation

The engine deliberately separates these concerns:

- **`TemplateRenderer`** — screen display with scaling, shadows, overflow clipping
- **`TemplatePrintRoot`** — print/PDF capture at real dimensions (scale=1), with CSS `page-break-after` between pages

A future PDF generation step should render `TemplatePrintRoot` into a hidden container and capture it with a library like `html2canvas` + `jsPDF`, or a headless browser. The template component itself should not contain any PDF-specific logic.

---

## Workflow for Adding Real Templates

1. Receive the PDF original
2. Create the template folder with all 5 files
3. Implement the HTML/CSS/React layout matching the original's dimensions, typography, and coordinates
4. Differentiate fixed elements (lines, headers, labels) from variable fields (names, amounts, years)
5. Define the field mapping in `mapping.json`
6. Register the template
7. Verify with sample data in the Template Library preview
8. Compare visually against the original
9. Complete and validate template N before starting template N+1
