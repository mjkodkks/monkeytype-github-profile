import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import monkeyTypeLogo from './utils/monkeyTypeIconBase64.ts'
import generateBadge from './template/index.ts'

const baseUrl = 'https://monkeytype.com/profile';
const PORT = Deno.env.get("PORT") || 8000;
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
    context.response.body = "Server is up!";
  })
  .get("/scapy/:userid", async (context) => {
    try {
      const userId = context?.params?.userid
      context.response.body = `<h1>no user id</h1>`
      context.response.type = 'text/html';
      if(!userId) return
      console.log('try scapy')
      const browser = await puppeteer.launch({
        headless: true,
        slowMo: 0, 
        args: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
      const page = await browser.newPage();
      await page.goto(`${baseUrl}/${userId}`, {waitUntil: 'networkidle2'});
      const name = await page.$eval('#pageProfile .name', (el: any) => el.textContent);
      console.info(name); 
      const pbsTime = await page.$$eval('#pageProfile .pbsTime .group .quick .wpm', (el: any) => el.map(m => m.textContent));
      const pbsWords = await page.$$eval('#pageProfile .pbsWords .group .quick .wpm', (el: any) => el.map(m => m.textContent));
      console.info(pbsTime, pbsWords); 
      const wpms = [...pbsTime, ...pbsWords].filter(f => f !== '-')
      const bestwpm = Array.isArray(wpms) && wpms.length > 0 ? Math.max(...wpms) : null
      // console.log(wpms)
      // console.log(bestwpm)
      context.response.body = generateBadge({ bestwpm, monkeyTypeLogo })
      context.response.type = `image/svg+xml` ;
      await browser.close();
    } catch(error) {
      console.log(error);
      context.response.body = `<h1>Error</h1>`
      context.response.type = 'text/html';
    }
  });

app.use(router.routes());
app.use(router.allowedMethods());

console.info('Listening on http://localhost:' + PORT);
await app.listen({ port: +PORT });