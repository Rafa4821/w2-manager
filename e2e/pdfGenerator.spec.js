// @ts-check
import { test, expect } from '@playwright/test'

async function waitForApp(page) {
  await page.goto('/')
  await page.waitForSelector('text=Active Companies', { timeout: 10000 })
}

test.describe('PDF Generator', () => {
  test.beforeEach(async ({ page }) => {
    await waitForApp(page)
    await page.getByRole('link', { name: /PDF Generator/i }).first().click()
    await page.waitForSelector('text=PDF Generator', { timeout: 5000 })
  })

  test('shows disclaimer about tax filing', async ({ page }) => {
    await expect(page.getByText(/not certified/i)).toBeVisible()
  })

  test('shows generate button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Generate/i }).first()).toBeVisible()
  })

  test('shows HTML print button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /HTML Print/i })).toBeVisible()
  })
})
