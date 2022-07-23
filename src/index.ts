import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { Bindings, Link } from './types'
import { Base64URL, randNum } from './util'

const app = new Hono<Bindings>()

app.use(logger(), prettyJSON())

app.get('/:id', async (ctx) => {
  const { id } = ctx.req.param()
  const { LINKS } = ctx.env
  const result = await LINKS.get(id)
  if (result) {
    return ctx.redirect(result, 302)
  }
})

app.post(
  '/add',
  async (ctx, next) => {
    const auth = basicAuth({
      username: ctx.env.USERNAME,
      password: ctx.env.PASSWORD,
    })
    await auth(ctx, next)
  },
  async (ctx) => {
    const link = await ctx.req.json<Link>()
    if (link.name) {
      ctx.env.LINKS.put(link.name, link.url)
      return ctx.json({
        status: 'ok',
        link: `/${link.name}`,
        redirect: link.url,
      })
    } else {
      let id = Base64URL.encode(randNum(10))
      // Ensure that the id is unique
      while (await ctx.env.LINKS.get(id)) {
        id = Base64URL.encode(randNum(10))
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

export default app
