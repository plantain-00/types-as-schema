import puppeteer from 'puppeteer'

(async() => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
  await page.goto(`http://localhost:8000/online`)
  await page.waitFor(2000)
  await page.screenshot({ path: `screenshots/initial.png` })

  await page.click('button')
  await page.waitFor(2000)
  await page.screenshot({ path: `screenshots/protobuf.png` })

  await page.select('select', 'cases.json')
  await page.waitFor(2000)
  await page.screenshot({ path: `screenshots/json.png` })

  await browser.close()
})()
