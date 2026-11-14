# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: importExport.spec.js >> Import / Export >> clear data requires confirmation dialog
- Location: e2e\importExport.spec.js:40:3

# Error details

```
Test timeout of 15000ms exceeded while running "beforeEach" hook.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]: W2 Manager
    - navigation [ref=e13]:
      - generic [ref=e14]:
        - link "Dashboard" [ref=e15] [cursor=pointer]:
          - /url: /
        - link "Companies" [ref=e22] [cursor=pointer]:
          - /url: /companies
        - link "Employees" [ref=e28] [cursor=pointer]:
          - /url: /employees
        - link "W2 Documents" [ref=e35] [cursor=pointer]:
          - /url: /w2-documents
      - generic [ref=e40]:
        - paragraph [ref=e41]: Tools
        - link "Templates" [ref=e42] [cursor=pointer]:
          - /url: /template-library
        - link "PDF Generator" [ref=e46] [cursor=pointer]:
          - /url: /pdf-generator
        - link "Import / Export" [ref=e52] [cursor=pointer]:
          - /url: /data-import-export
      - generic [ref=e57]:
        - paragraph [ref=e58]: System
        - link "Settings" [ref=e59] [cursor=pointer]:
          - /url: /settings
  - generic [ref=e64]:
    - banner [ref=e65]:
      - button [ref=e67] [cursor=pointer]
      - button [ref=e70] [cursor=pointer]
    - main [ref=e80]:
      - generic [ref=e81]:
        - generic [ref=e82]:
          - generic [ref=e85]:
            - paragraph [ref=e86]: Active Companies
            - paragraph [ref=e87]: "5"
          - generic [ref=e95]:
            - paragraph [ref=e96]: Total Employees
            - paragraph [ref=e97]: "8"
          - generic [ref=e106]:
            - paragraph [ref=e107]: W2 Documents
            - paragraph [ref=e108]: "0"
          - generic [ref=e115]:
            - paragraph [ref=e116]: Total Wages Reported
            - paragraph [ref=e117]: $0
        - generic [ref=e122]:
          - heading "Quick Actions" [level=3] [ref=e123]
          - generic [ref=e124]:
            - link "Add Company" [ref=e125] [cursor=pointer]:
              - /url: /companies
            - link "Add Employee" [ref=e134] [cursor=pointer]:
              - /url: /employees
            - link "Create W2 Document" [ref=e144] [cursor=pointer]:
              - /url: /w2-documents/new
        - generic [ref=e152]:
          - generic [ref=e153]:
            - generic [ref=e154]:
              - heading "Recent Documents" [level=3] [ref=e155]
              - link "View all" [ref=e156] [cursor=pointer]:
                - /url: /w2-documents
            - generic [ref=e157]: No documents yet. Create your first W2.
          - generic [ref=e159]:
            - heading "Recent Activity" [level=3] [ref=e161]
            - generic [ref=e162]:
              - generic [ref=e163]:
                - generic [ref=e168]:
                  - paragraph [ref=e169]: W2 document completed
                  - paragraph [ref=e170]: John Smith — Acme Corporation
                - generic [ref=e171]: 2 hours ago
              - generic [ref=e172]:
                - generic [ref=e179]:
                  - paragraph [ref=e180]: Employee added
                  - paragraph [ref=e181]: Lisa Martinez — Pacific Retail Group
                - generic [ref=e182]: 4 hours ago
              - generic [ref=e183]:
                - generic [ref=e189]:
                  - paragraph [ref=e190]: Company updated
                  - paragraph [ref=e191]: Global Tech Solutions
                - generic [ref=e192]: 6 hours ago
              - generic [ref=e193]:
                - generic [ref=e198]:
                  - paragraph [ref=e199]: Document drafted
                  - paragraph [ref=e200]: Sarah Johnson — Acme Corporation
                - generic [ref=e201]: 1 day ago
              - generic [ref=e202]:
                - generic [ref=e207]:
                  - paragraph [ref=e208]: W2 document generated
                  - paragraph [ref=e209]: Robert Chen — Global Tech Solutions
                - generic [ref=e210]: 1 day ago
              - generic [ref=e211]:
                - generic [ref=e216]:
                  - paragraph [ref=e217]: Employee removed
                  - paragraph [ref=e218]: Former Employee — Metro Construction
                - generic [ref=e219]: 2 days ago
```

# Test source

```ts
  1  | // @ts-check
  2  | import { test, expect } from '@playwright/test'
  3  | 
  4  | async function waitForApp(page) {
  5  |   await page.goto('/')
  6  |   await page.waitForSelector('text=Active Companies', { timeout: 10000 })
  7  | }
  8  | 
  9  | test.describe('Import / Export', () => {
> 10 |   test.beforeEach(async ({ page }) => {
     |        ^ Test timeout of 15000ms exceeded while running "beforeEach" hook.
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