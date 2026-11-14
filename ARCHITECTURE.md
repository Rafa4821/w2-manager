# Architecture — W2 Manager

## Screaming Architecture

This project follows **Screaming Architecture** — the folder structure is organized around business features (what the application *does*), not technical layers. When you look at the `src/features/` directory, you immediately understand the domain:

```
src/
├── features/                    # Business feature modules
│   ├── dashboard/               # Main overview and statistics
│   ├── companies/               # Employer/company management
│   ├── employees/               # Employee records
│   ├── w2-documents/            # W2 document creation and management
│   ├── template-library/        # W2 template browsing and management
│   ├── pdf-generator/           # PDF generation and download
│   ├── data-import-export/      # CSV/JSON import and export
│   └── settings/                # Application preferences
├── shared/                      # Cross-cutting shared code
│   ├── components/              # Reusable UI components
│   ├── hooks/                   # Shared custom hooks
│   ├── utils/                   # Shared utility functions
│   ├── validations/             # Shared Zod schemas
│   └── constants/               # App-wide constants and routes
├── layouts/                     # Page layout components
├── router/                      # React Router configuration
└── test/                        # Test setup and utilities
```

## Feature Module Structure

Each feature module follows a consistent internal structure:

```
features/<feature>/
├── components/                  # React components for this feature
│   ├── <FeaturePage>.jsx        # Main page component
│   └── index.js                 # Public exports
├── store/                       # Zustand state management
│   ├── use<Feature>Store.js     # Zustand store
│   └── index.js                 # Public exports
├── hooks/                       # Feature-specific hooks
├── utils/                       # Feature-specific utilities
├── validations/                 # Zod schemas for this feature
│   ├── <feature>Schema.js       # Validation schemas
│   └── index.js                 # Public exports
├── __tests__/                   # Tests for this feature
└── index.js                     # Public API of the feature
```

## Key Principles

### 1. Feature Isolation

Each feature is self-contained. Components, stores, hooks, utils, and validations belong to their feature. Features communicate through shared stores or props — never by importing internal files from another feature.

### 2. Public API via index.js

Each feature exposes its public interface through `index.js` barrel files. External code only imports from the feature's root:

```js
// Good — import from the feature root
import { CompaniesPage, useCompaniesStore } from '../features/companies'

// Bad — reaching into internal files
import { CompaniesPage } from '../features/companies/components/CompaniesPage'
```

### 3. Shared Code

Code used by 2+ features lives in `src/shared/`. This includes reusable components (`PageHeader`, `EmptyState`), constants (route paths), and cross-cutting utilities.

### 4. State Management

Each feature has its own Zustand store. Stores are lightweight, colocated with their feature, and use the `create` function directly — no providers needed.

### 5. Validation

Zod schemas are defined per-feature in `validations/`. They validate data structures before they enter the store.

### 6. Styling Strategy

- **Bootstrap 5**: Used for layout utilities, form controls, and pre-built components (buttons, cards, modals)
- **Tailwind CSS v4**: Used for custom utility styling with the `tw:` prefix to avoid class name conflicts with Bootstrap

### 7. Client-Only

The entire application runs in the browser. Data persists in memory (Zustand stores). No backend, APIs, Firebase, or database dependencies exist. Future persistence can be added via `localStorage` or IndexedDB without architectural changes.

## Module Responsibilities

| Module               | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `dashboard`          | Aggregated statistics, quick actions, overview          |
| `companies`          | CRUD for employer data (name, EIN, address)             |
| `employees`          | CRUD for employee records (name, SSN, address)          |
| `w2-documents`       | Create, edit, and manage W2 tax documents               |
| `template-library`   | Pre-built W2 templates for different scenarios          |
| `pdf-generator`      | Generate downloadable PDF files from W2 data            |
| `data-import-export` | Import/export data in CSV and JSON formats              |
| `settings`           | User preferences (theme, date format, language)         |

## Routing

All routes are defined centrally in `src/shared/constants/routes.js` and consumed by `src/router/AppRouter.jsx`. The layout uses a sidebar navigation via `src/layouts/MainLayout.jsx`.

## Testing

Tests are colocated with features in `__tests__/` directories. The project uses Vitest with JSDOM environment and Testing Library for component tests.
