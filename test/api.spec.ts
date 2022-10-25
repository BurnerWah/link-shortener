import { expect, test } from 'vitest'
import app from '../src'

const ADD_ENDPOINT = 'http://localhost/api/add'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

test('Add invalid URL', async () => {
  const env = getMiniflareBindings()
  const req = new Request(ADD_ENDPOINT, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      url: 'https:',
    }),
  })
  const res = await app.fetch(req, env)
  expect(res.status).toBe(400)
})

test('Add without URL', async () => {
  const env = getMiniflareBindings()
  const req = new Request(ADD_ENDPOINT, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  })
  const res = await app.fetch(req, env)
  expect(res.status).toBe(400)
})

test('Add link with name', async () => {
  const url = 'https://vitest.dev/'
  const name = 'vitest'

  const env = getMiniflareBindings()
  const req = new Request(ADD_ENDPOINT, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      url: url,
      name: name,
    }),
  })
  const res = await app.fetch(req, env)

  expect(res.status).toBe(200)
  expect(res.headers.get('Content-Type')).toContain('application/json')
  const json = await res.json<{
    status: string
    link: string
    redirect: string
  }>()
  expect(json.link).toBe(`/${name}`)
  expect(json.redirect).toBe(url)

  const redir = await app.fetch(new Request(`http://localhost/${name}`), env)
  expect(redir.status).toBe(302)
  expect(redir.headers.get('Location')).toBe(url)
})

test('Add link without a name', async () => {
  const env = getMiniflareBindings()
  const url = 'https://burner.gay/'
  const req = new Request(ADD_ENDPOINT, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      url: url,
    }),
  })
  const res = await app.fetch(req, env)
  expect(res.status).toBe(200)
  const json = await res.json<{
    status: string
    link: string
    redirect: string
  }>()
  expect(json.redirect).toBe(url)

  const redir = await app.fetch(
    new Request(`http://localhost${json.link}`),
    env,
  )
  expect(redir.status).toBe(302)
  expect(redir.headers.get('Location')).toBe(url)
})
