// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Import / Export', () => {
  test('shows export section with JSON and CSV buttons', async ({ page }) => {
    await page.goto('/data-import-export', { waitUntil: 'networkidle' })
    await expect(page.getByText('Export Data')).toBeVisible()
    await expect(page.getByRole('button', { name: /JSON/i }).first()).toBeVisible()
  })

  test('shows backup section with download button', async ({ page }) => {
    await page.goto('/data-import-export', { waitUntil: 'networkidle' })
    await expect(page.getByText('Download Full Backup')).toBeVisible()
  })

  test('shows import format selector (JSON / CSV)', async ({ page }) => {
    await page.goto('/data-import-export', { waitUntil: 'networkidle' })
    await expect(page.getByText('Import Data')).toBeVisible()
    await expect(page.getByRole('button', { name: 'JSON' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'CSV' }).first()).toBeVisible()
  })

  test('shows storage info panel', async ({ page }) => {
    await page.goto('/data-import-export', { waitUntil: 'networkidle' })
    await expect(page.getByText('Storage Information')).toBeVisible()
    await expect(page.getByText('Schema Version')).toBeVisible()
  })

  test('shows batch PDF export section', async ({ page }) => {
    await page.goto('/data-import-export', { waitUntil: 'networkidle' })
    await expect(page.getByText('Batch PDF Export')).toBeVisible()
  })

  test('clear data requires confirmation dialog', async ({ page }) => {
    await page.goto('/data-import-export', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /Clear All Data/i }).click()
    await expect(page.getByText(/permanently removed/i)).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: /Cancel/i }).click()
  })
})
