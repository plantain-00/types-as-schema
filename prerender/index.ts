import puppeteer from 'puppeteer'
import * as fs from 'fs'

(async() => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36' })
  await page.waitFor(1000)
  await page.goto('http://localhost:8000/online')
  await page.waitFor(2000)
  const content = await page.evaluate(() => {
    const element = document.querySelector('#prerender-container')
    return element ? element.innerHTML.trim() : ''
  })
  fs.writeFileSync('prerender/index.html', content)

  await browser.close()
})()
