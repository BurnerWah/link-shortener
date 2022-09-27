import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { Base64URL, randNum } from './util'

// The internal API is expected to be protected by Cloudflare Access, so
// no authentication is implemented.
const api = new Hono<Env>()

api.post(
  '/add',
  validator((v) => ({
    // Fully validating the URL is annoying
    url: v.json('url').isRequired().isLength({ min: 8 }),
    // Further validation of name causes 500 errors.
    name: v.json('name').isOptional(),
  })),
  async (ctx) => {
    const link: Link = ctx.req.valid()
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
  },
)

export default api
