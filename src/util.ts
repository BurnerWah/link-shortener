import { Bindings } from './types.d'
import Base64url from 'crypto-js/enc-base64url'
import Utf8 from 'crypto-js/enc-utf8'
import { Context } from 'hono'

export const Base64URL = {
  encode: (str: string) => Base64url.stringify(Utf8.parse(str)),
  decode: (str: string) => Utf8.stringify(Base64url.parse(str)),
}

export function randNum(length: number) {
  const num = Math.floor(Math.random() * Math.pow(10, length))
  return num.toString().padStart(length, '0')
}

export async function hasLink<T extends string>(
  ctx: Context<T, Bindings>,
  id: string,
) {
  const { LINKS } = ctx.env
  const result = await LINKS.get(id)
  return result ? true : false
}
