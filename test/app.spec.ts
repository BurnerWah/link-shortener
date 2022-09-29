import robotsParser from 'robots-parser'
import { beforeAll, expect, test } from 'vitest'
import app from '../src'

beforeAll(async () => {
  const { LINKS } = getMiniflareBindings()
  await LINKS.put('vitest', 'https://vitest.dev/')
})

test('GET / 404s', async () => {
  const res = await app.request('http://localhost/')
  expect(res.status).toBe(404)
})

test('Redirecting a link', async () => {
  // This test will fail if we use request() instead of fetch()
  const req = new Request('http://localhost/vitest')
  const res = await app.fetch(req, getMiniflareBindings())
  console.log(res.status)
  expect(res.status).toBe(302)
  expect(res.headers.get('Location')).toBe('https://vitest.dev/')
})

test('Redirecting non-existent link', async () => {
  const req = new Request('http://localhost/does-not-exist')
  const res = await app.fetch(req, getMiniflareBindings())
  expect(res.status).toBe(404)
})

test('Validate robots.txt', async () => {
  const res = await app.request('http://localhost/.well-known/robots.txt')
  expect(res.status).toBe(200)
  expect(res.headers.get('Content-Type')).toContain('text/plain')
  const text = await res.text()
  const robots = robotsParser('/robots.txt', text)
  expect(robots.isAllowed('/foo', 'Googlebot')).toBe(false)
  expect(robots.isAllowed('/foo', 'TelegramBot (like TwitterBot)')).toBe(true)

  const res2 = await app.request('http://localhost/robots.txt')
  expect(res2.status).toBe(200)
})
