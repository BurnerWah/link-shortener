import { Context, Hono } from 'hono'
import { logger } from 'hono/logger'
import { poweredBy } from 'hono/powered-by'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import { ROBOTS_TXT } from './strings'

const app = new Hono<Env>()

app.use(logger(), prettyJSON(), poweredBy())

app.get('/robots.txt', (ctx) => ctx.text(ROBOTS_TXT))
app.get('/.well-known/robots.txt', (ctx) => ctx.text(ROBOTS_TXT))

// Function factory to let us reuse the code for the entire redirector.
function redirectGen<T extends string>(id_name: T) {
  return async function (ctx: Context<T, Env>) {
    const id = ctx.req.param(id_name)
    const { LINKS } = ctx.env
    const result = await LINKS.get(id)
    if (result) {
      return ctx.redirect(result, 302)
    } else {
      return ctx.notFound()
    }
  }
}

app.get('/:id', redirectGen('id'))
app.get('/go/:id2', redirectGen('id2'))

app.route('/api', api)

export default app
