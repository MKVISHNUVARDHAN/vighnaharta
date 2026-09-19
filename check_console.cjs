const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log("Navigating to localhost:3000...");
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log("Page loaded. Waiting 2 seconds...");
    await new Promise(r => setTimeout(r, 2000));
    
    // Click start button if it exists
    try {
      const btn = await page.$('button');
      if (btn) {
        console.log("Clicking start button...");
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch(e) {}
    
    console.log("Done. Closing browser.");
  } catch (err) {
    console.error("Navigation failed:", err);
  } finally {
    await browser.close();
  }
})();
