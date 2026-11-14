# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: importExport.spec.js >> Import / Export >> clear data requires confirmation dialog
- Location: e2e\importExport.spec.js:38:3

# Error details

```
Test timeout of 15000ms exceeded while running "beforeEach" hook.
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - generic [ref=f1e5]: W2 Manager
    - navigation [ref=f1e13]:
      - generic [ref=f1e14]:
        - link "Dashboard" [ref=f1e15] [cursor=pointer]:
          - /url: /
        - link "Companies" [ref=f1e22] [cursor=pointer]:
          - /url: /companies
        - link "Employees" [ref=f1e28] [cursor=pointer]:
          - /url: /employees
        - link "W2 Documents" [ref=f1e35] [cursor=pointer]:
          - /url: /w2-documents
      - generic [ref=f1e40]:
        - paragraph [ref=f1e41]: Tools
        - link "Templates" [ref=f1e42] [cursor=pointer]:
          - /url: /template-library
        - link "PDF Generator" [ref=f1e46] [cursor=pointer]:
          - /url: /pdf-generator
        - link "Import / Export" [ref=f1e52] [cursor=pointer]:
          - /url: /data-import-export
      - generic [ref=f1e57]:
        - paragraph [ref=f1e58]: System
        - link "Settings" [ref=f1e59] [cursor=pointer]:
          - /url: /settings
  - generic [ref=f1e64]:
    - banner [ref=f1e65]:
      - button [ref=f1e67] [cursor=pointer]
      - button [ref=f1e70] [cursor=pointer]
    - main [ref=f1e80]:
      - generic [ref=f1e81]:
        - generic [ref=f1e82]:
          - generic [ref=f1e85]:
            - paragraph [ref=f1e86]: Active Companies
            - paragraph [ref=f1e87]: "5"
          - generic [ref=f1e95]:
            - paragraph [ref=f1e96]: Total Employees
            - paragraph [ref=f1e97]: "8"
          - generic [ref=f1e106]:
            - paragraph [ref=f1e107]: W2 Documents
            - paragraph [ref=f1e108]: "0"
          - generic [ref=f1e115]:
            - paragraph [ref=f1e116]: Total Wages Reported
            - paragraph [ref=f1e117]: $0
        - generic [ref=f1e122]:
          - heading "Quick Actions" [level=3] [ref=f1e123]
          - generic [ref=f1e124]:
            - link "Add Company" [ref=f1e125] [cursor=pointer]:
              - /url: /companies
            - link "Add Employee" [ref=f1e134] [cursor=pointer]:
              - /url: /employees
            - link "Create W2 Document" [ref=f1e144] [cursor=pointer]:
              - /url: /w2-documents/new
        - generic [ref=f1e152]:
          - generic [ref=f1e153]:
            - generic [ref=f1e154]:
              - heading "Recent Documents" [level=3] [ref=f1e155]
              - link "View all" [ref=f1e156] [cursor=pointer]:
                - /url: /w2-documents
            - generic [ref=f1e157]: No documents yet. Create your first W2.
          - generic [ref=f1e159]:
            - heading "Recent Activity" [level=3] [ref=f1e161]
            - generic [ref=f1e162]:
              - generic [ref=f1e163]:
                - generic [ref=f1e168]:
                  - paragraph [ref=f1e169]: W2 document completed
                  - paragraph [ref=f1e170]: John Smith — Acme Corporation
                - generic [ref=f1e171]: 2 hours ago
              - generic [ref=f1e172]:
                - generic [ref=f1e179]:
                  - paragraph [ref=f1e180]: Employee added
                  - paragraph [ref=f1e181]: Lisa Martinez — Pacific Retail Group
                - generic [ref=f1e182]: 4 hours ago
              - generic [ref=f1e183]:
                - generic [ref=f1e189]:
                  - paragraph [ref=f1e190]: Company updated
                  - paragraph [ref=f1e191]: Global Tech Solutions
                - generic [ref=f1e192]: 6 hours ago
              - generic [ref=f1e193]:
                - generic [ref=f1e198]:
                  - paragraph [ref=f1e199]: Document drafted
                  - paragraph [ref=f1e200]: Sarah Johnson — Acme Corporation
                - generic [ref=f1e201]: 1 day ago
              - generic [ref=f1e202]:
                - generic [ref=f1e207]:
                  - paragraph [ref=f1e208]: W2 document generated
                  - paragraph [ref=f1e209]: Robert Chen — Global Tech Solutions
                - generic [ref=f1e210]: 1 day ago
              - generic [ref=f1e211]:
                - generic [ref=f1e216]:
                  - paragraph [ref=f1e217]: Employee removed
                  - paragraph [ref=f1e218]: Former Employee — Metro Construction
                - generic [ref=f1e219]: 2 days ago
```

# Test source

```ts
  1  | // @ts-check
  2  | import { test, expect } from '@playwright/test'
  3  | 
  4  | async function waitForApp(page) {
> 5  |   await page.goto('/')
     |        ^ Test timeout of 15000ms exceeded while running "beforeEach" hook.
  6  |   await page.waitForSelector('text=Active Companies', { timeout: 10000 })
  7  | }
  8  | 
  9  | test.describe('Import / Export', () => {
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await waitForApp(page)
  12 |     await page.getByRole('link', { name: /Import/i }).first().click()
  13 |     await page.waitForSelector('text=Export Data', { timeout: 5000 })
  14 |   })
  15 | 
  16 |   test('shows export section with JSON and CSV buttons', async ({ page }) => {
  17 |     await expect(page.getByText('Export Data')).toBeVisible()
  18 |     await expect(page.getByRole('button', { name: /JSON/i }).first()).toBeVisible()
  19 |   })
  20 | 
  21 |   test('shows backup section with download button', async ({ page }) => {
  22 |     await expect(page.getByText('Download Full Backup')).toBeVisible()
  23 |   })
  24 | 
  25 |   test('shows import format selector (JSON / CSV)', async ({ page }) => {
  26 |     await expect(page.getByText('Import Data')).toBeVisible()
  27 |     await expect(page.getByRole('button', { name: 'JSON' }).first()).toBeVisible()
  28 |     await expect(page.getByRole('button', { name: 'CSV' }).first()).toBeVisible()
  29 |   })
  30 | 
  31 |   test('shows storage info panel', async ({ page }) => {
  32 |     await expect(page.getByText('Storage Information')).toBeVisible()
  33 |     await expect(page.getByText('Schema Version')).toBeVisible()
  34 |   })
  35 | 
  36 |   test('shows batch PDF export section', async ({ page }) => {
  37 |     await expect(page.getByText('Batch PDF Export')).toBeVisible()
  38 |   })
  39 | 
  40 |   test('clear data requires confirmation dialog', async ({ page }) => {
  41 |     await page.getByRole('button', { name: /Clear All Data/i }).click()
  42 |     await expect(page.getByText(/permanently removed/i)).toBeVisible({ timeout: 3000 })
  43 |     await page.getByRole('button', { name: /Cancel/i }).click()
  44 |   })
  45 | })
  46 | 
```