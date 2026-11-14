import { test, expect } from '@playwright/test'

test('debug: full navigation flow', async ({ page }) => {
  console.log('Step 1: goto /')
  await page.goto('/', { waitUntil: 'networkidle' })
  console.log('Step 2: page loaded, checking text')
  
  const text = await page.innerText('body')
  console.log('Has Active Companies:', text.includes('Active Companies'))
  console.log('Has Add Company:', text.includes('Add Company'))
  
  console.log('Step 3: clicking Companies sidebar link')
  await page.getByRole('link', { name: 'Companies' }).first().click()
  await page.waitForTimeout(2000)
  
  console.log('Step 4: after click, checking page')
  const text2 = await page.innerText('body')
  console.log('URL:', page.url())
  console.log('Has Add Company button:', text2.includes('Add Company'))
  console.log('Body text (first 300):', text2.slice(0, 300))
  
  await page.screenshot({ path: 'e2e-debug-companies.png', fullPage: true })
  expect(true).toBe(true)
})
