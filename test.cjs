const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log('FAILED RESPONSE:', response.status(), response.url());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE EXCEPTION:', err.toString(), err.stack);
  });

  await page.goto('http://localhost:3000/content', { waitUntil: 'networkidle2' });
  
  const content = await page.content();
  if (content.includes("Failed to fetch")) {
     console.log("Failed to fetch seen in output.");
  }
  
  await browser.close();
})();
