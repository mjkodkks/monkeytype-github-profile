import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import "https://deno.land/std@0.208.0/dotenv/load.ts";
import monkeyTypeLogo from './utils/monkeyTypeIconBase64.ts'
import generateBadge from './template/index.ts'
import { MonkeyTypeResponse } from './types/response.d.ts';
import { Redis } from "https://esm.sh/@upstash/redis";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL"),
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")
})
const MONKEYTYPE = 'monkeytype';

const baseUrl = 'https://api.monkeytype.com';
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
  .get("/profile/:userid", async (context) => {
    try {
      const userId = context?.params?.userid
      context.response.body = `<h1>no user id</h1>`
      context.response.type = 'text/html';
      if (!userId) return
      const saveKey = `${MONKEYTYPE}-${userId}`
      // get caching from redis
      const cachedMaxWpm = await redis.get(saveKey)
      if (cachedMaxWpm) {
        console.info('hit cache : ', userId, cachedMaxWpm) 
        context.response.body = generateBadge({ bestwpm: cachedMaxWpm, monkeyTypeLogo })
        context.response.type = `image/svg+xml`;
        return
      }

      const fullUrl = `${baseUrl}/users/${userId}/profile`
      const response: MonkeyTypeResponse = await fetch(fullUrl).then(res => res.json())
      const data = response.data
      const { name, personalBests } = data
      const { time, words } = personalBests

      let maxWpm = 0
      if (data) {
        const entries = [...Object.entries(time), ...Object.entries(words)];
        for (const [key, value] of entries) {
          const wpm = Math.max(...value.map(m => Math.round(m.wpm)));
          if (wpm > maxWpm) maxWpm = wpm;
        }
      }
      console.info(name, maxWpm)
      context.response.body = generateBadge({ bestwpm: maxWpm, monkeyTypeLogo })
      context.response.type = `image/svg+xml`;

      await redis.set(saveKey, maxWpm)
      await redis.expire(saveKey, maxWpm)

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