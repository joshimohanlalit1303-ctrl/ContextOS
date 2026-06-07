import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extPath = path.join(__dirname, 'dist');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`
    ]
  });
  const targets = await browser.targets();
  const backgroundPage = targets.find(t => t.type() === 'service_worker' || t.type() === 'background_page');
  
  if (backgroundPage) {
    const worker = await backgroundPage.worker();
    worker.on('console', msg => console.log('WORKER LOG:', msg.text()));
    worker.on('error', err => console.error('WORKER ERROR:', err));
  }

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  
  // Try to load the side panel
  await page.goto(`chrome-extension://gdmbngkdnfimmkiokldjmmadpoamdham/index.html`).catch(e => console.error(e));
  
  // If the hardcoded ID is wrong, we can find it
  const extTarget = targets.find(t => t.url().startsWith('chrome-extension://') && t.type() === 'service_worker');
  if (extTarget) {
      const url = new URL(extTarget.url());
      console.log('Found extension ID:', url.hostname);
      await page.goto(`chrome-extension://${url.hostname}/index.html`);
  }
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
