import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { ROUTES } from '../shared/constants'
import { DashboardPage } from '../features/dashboard'
import { CompaniesPage } from '../features/companies'
import { EmployeesPage } from '../features/employees'
import { W2DocumentsPage } from '../features/w2-documents'
import { TemplateLibraryPage } from '../features/template-library'
import { PdfGeneratorPage } from '../features/pdf-generator'
import { DataImportExportPage } from '../features/data-import-export'
import { SettingsPage } from '../features/settings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.COMPANIES.slice(1), element: <CompaniesPage /> },
      { path: ROUTES.EMPLOYEES.slice(1), element: <EmployeesPage /> },
      { path: ROUTES.W2_DOCUMENTS.slice(1), element: <W2DocumentsPage /> },
      { path: ROUTES.TEMPLATE_LIBRARY.slice(1), element: <TemplateLibraryPage /> },
      { path: ROUTES.PDF_GENERATOR.slice(1), element: <PdfGeneratorPage /> },
      { path: ROUTES.DATA_IMPORT_EXPORT.slice(1), element: <DataImportExportPage /> },
      { path: ROUTES.SETTINGS.slice(1), element: <SettingsPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
