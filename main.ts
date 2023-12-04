import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const baseUrl = 'https://monkeytype.com/profile';
// const url = 'https://google.co.th';

const app = new Application();

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .get("/scapy/:userid", async (context) => {
    try {
      const userId = context?.params?.userid
      context.response.body = `<h1>no user id</h1>`
      context.response.type = 'text/html';
      if(!userId) return
      console.log('try scapy')
      const browser = await puppeteer.launch({
        headless: false,
        slowMo: 250, // slow down by 250ms
      });
      const page = await browser.newPage();
      await page.goto(`${baseUrl}/${userId}`);
      // accept the cookie popup
      // const element = await page.waitForSelector('#cookiePopup .acceptAll');
      // await element.click();
      const name = await page.$eval('#pageProfile .name', (el: any) => el.textContent);
      console.log(name); 
      const pbsTime = await page.$$eval('#pageProfile .pbsTime .group .quick .wpm', (el: any) => el.map(m => m.textContent));
      const pbsWords = await page.$$eval('#pageProfile .pbsWords .group .quick .wpm', (el: any) => el.map(m => m.textContent));
      console.log(pbsTime, pbsWords); 
      const wpms = [...pbsTime, ...pbsWords].filter(f => f !== '-')
      const bestwpm = Array.isArray(wpms) && wpms.length > 0 ? Math.max(...wpms) : null
      console.log(wpms)
      console.log(bestwpm)
      context.response.body = `<h1>Best WPM: ${bestwpm}</h1>`
      context.response.type = 'text/html';
      await browser.close();
    } catch(error) {
      console.log(error);
      context.response.body = `<h1>Error</h1>`
      context.response.type = 'text/html';
    }
  });

const PORT = 8000
app.use(router.routes());
app.use(router.allowedMethods());

console.info('Listening on http://localhost:' + PORT);
await app.listen({ port: PORT });