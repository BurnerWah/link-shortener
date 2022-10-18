import Base64url from 'crypto-js/enc-base64url'
import Utf8 from 'crypto-js/enc-utf8'

export const Base64URL = {
  encode: (str: string) => Base64url.stringify(Utf8.parse(str)),
  decode: (str: string) => Utf8.stringify(Base64url.parse(str)),
}

export function randNum(length: number) {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  const num = arr[0]
  return num.toString().padStart(length, '0')
}
