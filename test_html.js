import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  const html = await page.content();
  console.log('--- BODY HTML ---');
  console.log(html.substring(0, 500));
  console.log('...');
  console.log(html.substring(html.length - 500));
  await browser.close();
})();
