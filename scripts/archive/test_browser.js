import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => console.log(response.status(), response.url()));
  page.on('requestfailed', request => console.log('REQ FAIL:', request.failure().errorText, request.url()));

  console.log('Navigating to localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  console.log('Navigation complete');
  
  await browser.close();
})();
