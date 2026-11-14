// @ts-check
import { test, expect } from '@playwright/test'

test.describe('PDF Generator', () => {
  test('shows disclaimer about tax filing', async ({ page }) => {
    await page.goto('/pdf-generator', { waitUntil: 'networkidle' })
    await expect(page.getByText(/not certified/i)).toBeVisible()
  })

  test('shows generate button', async ({ page }) => {
    await page.goto('/pdf-generator', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /Generate/i }).first()).toBeVisible()
  })

  test('shows HTML print button', async ({ page }) => {
    await page.goto('/pdf-generator', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /HTML Print/i })).toBeVisible()
  })
})
