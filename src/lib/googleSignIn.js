import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Crypto from 'expo-crypto'
import * as Linking from 'expo-linking'
import * as SecureStore from 'expo-secure-store'
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_MOBILE_REDIRECT_BRIDGE_URL } from './config'

const AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const PENDING_KEY = 'mzobs-pending-google-auth'
// If Android kills the app while the Custom Tab is open (common under memory
// pressure, or whenever the user swipes the app away mid sign-in), the
// redirect relaunches a brand-new process — the original in-memory Promise
// from openAuthSessionAsync is gone with it. A stash this old is assumed
// abandoned rather than replayed into an unrelated later launch.
const PENDING_TTL_MS = 5 * 60 * 1000

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

// Native Google sign-in: the Android account picker sheet, no browser involved, so it can't
// get stuck in Chrome's account chooser. The ID token is issued for the Web client ID, so the
// backend verifies it exactly like the browser flow's token. It needs an Android OAuth client
// (this app's package + signing SHA-1) in Google Cloud; until that exists, or if Play Services
// is missing, this throws and googleSignIn() falls back to the browser flow below.
async function nativeGoogleSignIn() {
  // Loaded lazily so a build/runtime without the native module (Expo Go) just falls back.
  const { GoogleSignin } = require('@react-native-google-signin/google-signin')
  if (!nativeConfigured) {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, scopes: ['profile', 'email'] })
    nativeConfigured = true
  }
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  // Forget the last account so the picker always shows, like the browser flow's select_account.
  await GoogleSignin.signOut().catch(() => {})
  const response = await GoogleSignin.signIn()
  if (response.type !== 'success') return { cancelled: true }
  const { idToken, user } = response.data
  if (!idToken) throw new Error('Google did not return an ID token.')
  return { idToken, name: user?.name ?? '', email: user?.email ?? '' }
}
let nativeConfigured = false

// Returns the ID token plus the profile fields (so screens can prefill name/email without a
// round trip) or null if the user dismissed the sign-in. The ID token is only trusted once the
// backend verifies its signature.
export async function googleSignIn() {
  try {
    const result = await nativeGoogleSignIn()
    return result.cancelled ? null : result
  } catch (err) {
    if (__DEV__) console.warn('Native Google sign-in unavailable, using the browser flow:', err?.code ?? err?.message)
    return browserGoogleSignIn()
  }
}

function fromRedirectUrl(url, expectedState) {
  const params = parseFragmentParams(url)
  if (params.error) throw new Error(params.error_description || params.error)
  if (params.state !== expectedState) throw new Error('Google sign-in response did not match the request. Please try again.')

  const idToken = params.id_token
  if (!idToken) throw new Error('Google did not return an ID token. Please try again.')

  const payload = decodeJwtPayload(idToken)
  return { idToken, name: payload.name ?? '', email: payload.email ?? '' }
}

// Browser-based fallback: opens Google's OAuth page in a Custom Tab and returns via the backend bridge.
async function browserGoogleSignIn() {
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

  // Stashed so a killed-and-relaunched app can still finish the sign-in on
  // its next mount — see checkPendingGoogleRedirect().
  await SecureStore.setItemAsync(PENDING_KEY, JSON.stringify({ state, at: Date.now() })).catch(() => {})

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl)
  if (result.type !== 'success') return null

  SecureStore.deleteItemAsync(PENDING_KEY).catch(() => {})
  return fromRedirectUrl(result.url, state)
}

// Called once on app launch (see PhoneAuthScreen). If the app was killed
// while the Google OAuth browser was open, the redirect back into
// `mzobs://redirect` relaunches the app cold — this recovers that instead of
// leaving the user stuck looking at a browser that already closed itself.
export async function checkPendingGoogleRedirect() {
  try {
    const raw = await SecureStore.getItemAsync(PENDING_KEY)
    if (!raw) return null
    await SecureStore.deleteItemAsync(PENDING_KEY).catch(() => {})

    const { state, at } = JSON.parse(raw)
    if (!state || Date.now() - at > PENDING_TTL_MS) return null

    const initialUrl = await Linking.getInitialURL()
    if (!initialUrl || !initialUrl.includes('redirect')) return null

    return fromRedirectUrl(initialUrl, state)
  } catch {
    return null
  }
}
