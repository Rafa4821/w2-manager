// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Companies CRUD', () => {
  test('shows companies page with add button', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /Add Company/i })).toBeVisible()
  })

  test('opens create company modal', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /Add Company/i }).click()
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 3000 })
  })

  test('company table shows seed data', async ({ page }) => {
    await page.goto('/companies', { waitUntil: 'networkidle' })
    // Seed data includes companies like Acme Corporation
    await expect(page.getByText('Acme Corporation')).toBeVisible()
  })
})
