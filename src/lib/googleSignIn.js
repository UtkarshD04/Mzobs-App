import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Crypto from 'expo-crypto'
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_MOBILE_REDIRECT_BRIDGE_URL } from './config'

const AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'

// Google only accepts an https:// redirect_uri on a Web-application OAuth
// client (no custom app scheme), so the request sends users through the
// backend's bridge page, which then hands off to this app-scheme URL — see
// GOOGLE_MOBILE_REDIRECT_BRIDGE_URL in config.js. WebBrowser watches for
// *this* URL (not the one Google itself redirects to) to know the flow
// finished, and closes the browser automatically when it's reached.
function getAppReturnUrl() {
  return AuthSession.makeRedirectUri({ scheme: 'mzobs', path: 'redirect' })
}

function parseFragmentParams(url) {
  const fragment = url.split('#')[1] ?? ''
  const params = {}
  for (const pair of fragment.split('&')) {
    if (!pair) continue
    const [key, value] = pair.split('=')
    params[decodeURIComponent(key)] = decodeURIComponent(value ?? '')
  }
  return params
}

// Hermes (React Native's JS engine) has no built-in atob/Buffer, so the
// base64url segment is decoded by hand into a UTF-8 string.
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function base64UrlDecodeToUtf8(base64Url) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = []
  let buffer = 0
  let bits = 0
  for (const char of base64) {
    const value = BASE64_CHARS.indexOf(char)
    if (value === -1) continue
    buffer = (buffer << 6) | value
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes.push((buffer >> bits) & 0xff)
    }
  }

  let result = ''
  for (let i = 0; i < bytes.length; ) {
    const byte1 = bytes[i++]
    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1)
    } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
      const byte2 = bytes[i++]
      result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f))
    } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
      const byte2 = bytes[i++]
      const byte3 = bytes[i++]
      result += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f))
    } else {
      const byte2 = bytes[i++]
      const byte3 = bytes[i++]
      const byte4 = bytes[i++]
      const codepoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f)
      result += String.fromCodePoint(codepoint)
    }
  }
  return result
}

function decodeJwtPayload(token) {
  const base64Url = token.split('.')[1] ?? ''
  return JSON.parse(base64UrlDecodeToUtf8(base64Url))
}

// Returns the ID token plus the profile fields decoded from it (so screens
// can prefill name/email without a round trip) — or null if the user
// dismissed the browser before finishing. The ID token is only trusted once
// the backend verifies its signature — the client-side decode here is for
// prefill display purposes only, same trust level the native picker's own
// profile fields had before.
export async function googleSignIn() {
  const returnUrl = getAppReturnUrl()
  const state = Crypto.randomUUID()
  const nonce = Crypto.randomUUID()

  const authUrl =
    `${AUTHORIZATION_ENDPOINT}?` +
    new URLSearchParams({
      client_id: GOOGLE_WEB_CLIENT_ID,
      redirect_uri: GOOGLE_MOBILE_REDIRECT_BRIDGE_URL,
      response_type: 'id_token',
      scope: 'openid profile email',
      prompt: 'select_account',
      state,
      nonce,
    }).toString()

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl)
  if (result.type !== 'success') return null

  const params = parseFragmentParams(result.url)
  if (params.error) throw new Error(params.error_description || params.error)
  if (params.state !== state) throw new Error('Google sign-in response did not match the request. Please try again.')

  const idToken = params.id_token
  if (!idToken) throw new Error('Google did not return an ID token. Please try again.')

  const payload = decodeJwtPayload(idToken)
  return { idToken, name: payload.name ?? '', email: payload.email ?? '' }
}
