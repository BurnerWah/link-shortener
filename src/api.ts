import { Hono } from 'hono'
import { Base64URL, randNum } from './util'

// The internal API is expected to be protected by Cloudflare Access, so
// no authentication is implemented.
const api = new Hono<Env>()

api.post('/add', async (ctx) => {
  const link = await ctx.req.json<Link>()
  if (link.name) {
    ctx.env.LINKS.put(link.name, link.url)
    return ctx.json({
      status: 'ok',
      link: `/${link.name}`,
      redirect: link.url,
    })
  } else {
    let id = Base64URL.encode(randNum(7))
    // Ensure that the id is unique
    while (await ctx.env.LINKS.get(id)) {
      id = Base64URL.encode(randNum(7))
    }
    ctx.env.LINKS.put(id, link.url)
    return ctx.json({
      status: 'ok',
      link: `/${id}`,
      redirect: link.url,
    })
  }
})

export default api
