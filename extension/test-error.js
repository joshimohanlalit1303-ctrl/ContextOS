import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extPath = path.join(__dirname, 'dist');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`
    ]
  });

  try {
    const targets = await browser.targets();
    // Find the extension ID
    const extTarget = targets.find(t => t.url().startsWith('chrome-extension://') && t.type() === 'service_worker');
    if (!extTarget) {
      console.log('No extension target found');
      await browser.close();
      return;
    }

    const url = new URL(extTarget.url());
    const extId = url.hostname;
    console.log('Extension ID:', extId);

    const page = await browser.newPage();
    
    // Capture EVERYTHING
    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to side panel...');
    await page.goto(`chrome-extension://${extId}/index.html`, { waitUntil: 'networkidle0' });
    
    console.log('Page loaded. Wait 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));
    
    const html = await page.content();
    console.log('HTML CONTENT:', html.substring(0, 500));
    
  } catch (err) {
    console.log('TEST ERROR:', err);
  } finally {
    await browser.close();
  }
})();
