// @ts-check
import { test, expect } from '@playwright/test'

/** Wait for React SPA to render by checking for sidebar content */
async function waitForApp(page) {
  await page.goto('/')
  await page.waitForSelector('text=Active Companies', { timeout: 10000 })
}

test.describe('Navigation', () => {
  test('loads the app and shows stat cards on dashboard', async ({ page }) => {
    await waitForApp(page)
    await expect(page.getByText('Active Companies')).toBeVisible()
    await expect(page.getByText('Total Employees')).toBeVisible()
  })

  test('sidebar links navigate to each section', async ({ page }) => {
    await waitForApp(page)

    await page.getByRole('link', { name: /Companies/i }).first().click()
    await expect(page.getByRole('button', { name: /Add Company/i })).toBeVisible({ timeout: 5000 })

    await page.getByRole('link', { name: /Employees/i }).first().click()
    await expect(page.getByRole('button', { name: /Add Employee/i })).toBeVisible({ timeout: 5000 })

    await page.getByRole('link', { name: /Templates/i }).first().click()
    await expect(page.getByText('Template Library')).toBeVisible({ timeout: 5000 })

    await page.getByRole('link', { name: /Import/i }).first().click()
    await expect(page.getByText('Export Data')).toBeVisible({ timeout: 5000 })

    await page.getByRole('link', { name: /Settings/i }).first().click()
    await expect(page.getByText('Settings')).toBeVisible({ timeout: 5000 })
  })

  test('responsive: mobile viewport loads correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await waitForApp(page)
    await expect(page.getByText('Active Companies')).toBeVisible()
  })
})
