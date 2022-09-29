import { expect, test } from 'vitest'
import { Base64URL } from './../src/util'

test('Base64URL Encode/Decode', () => {
  const str = 'Hello World'
  const str_encoded = 'SGVsbG8gV29ybGQ'

  const enc = Base64URL.encode(str)
  expect(enc).toBe(str_encoded)
  const dec = Base64URL.decode(enc)
  expect(dec).toBe(str)
})
