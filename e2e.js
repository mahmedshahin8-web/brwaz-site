import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('BROWSER_LOG:', msg.type(), msg.text());
  });

  await page.goto('http://localhost:3000');
  
  await page.type('textarea[placeholder*="اكتب فكرة الحلقة هنا"]', 'اختبار الفكرة');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('ابدأ توليد الأفكار'));
    if (btn) btn.click();
  });
  
  // wait for something to happen
  await new Promise(r => setTimeout(r, 15000));
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log("PAGE TEXT:", content.substring(0, 1000));
  
  const consoleMsgs = await page.evaluate(() => window.errors || []);
  console.log("ERRORS:", consoleMsgs);

  await browser.close();
})();
