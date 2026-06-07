import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set exactly the size Google requires
  await page.setViewport({ width: 1280, height: 800 });
  
  // Create a beautiful placeholder UI
  await page.setContent(`
    <html>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f172a, #1e293b); display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, system-ui, sans-serif;">
        <div style="text-align: center;">
          <h1 style="color: white; font-size: 80px; margin: 0; letter-spacing: -2px; font-weight: 800;">Libro</h1>
          <p style="color: #94a3b8; font-size: 32px; margin-top: 20px; font-weight: 500;">The Universal Memory Layer For AI.</p>
        </div>
      </body>
    </html>
  `);
  
  await page.screenshot({ path: '/Users/lalit/Desktop/libro-store-screenshot.png' });
  await browser.close();
  console.log("Screenshot created successfully!");
})();
