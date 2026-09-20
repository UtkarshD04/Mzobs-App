import Constants from 'expo-constants'
import { Platform } from 'react-native'
import * as Device from 'expo-device'

const BACKEND_PORT = 4000

// Expo Go / native builds can't reach a bare "localhost" the way a browser
// tab can. Instead of hardcoding the machine's LAN IP (which changes across
// networks/reboots and goes stale), derive it from the Metro dev server host
// that Expo Go already connected to — same machine, so same LAN IP.
function getDevServerApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost
  let host = hostUri?.split(':')[0]
  // Simulators/emulators share the host machine's network stack (or, for
  // Android, a fixed NAT alias to it) — use that directly rather than relying
  // on hostUri, which isn't reliably populated on every build type (dev
  // client vs Expo Go) and, for iOS, can hairpin-fail through the Mac's LAN IP.
  if (!Device.isDevice) host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
  return host ? `http://${host}:${BACKEND_PORT}` : null
}

const FALLBACK_API_URL = 'http://localhost:4000'

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getDevServerApiUrl() ?? FALLBACK_API_URL
export const API_BASE = `${API_URL}/api/employee`
export const FILE_BASE_URL = API_URL

// Google Web-application OAuth client ID — must be the same one the backend verifies
// tokens against (GOOGLE_CLIENT_ID) and the website uses.
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? ''

// MSG91 OTP widget credentials (dashboard -> OTP -> Widget, with "Mobile
// Integration" enabled). Both unset -> the app falls back to the backend's
// own send-otp/verify-otp endpoints (see lib/msg91Widget.js).
export const MSG91_WIDGET_ID = process.env.EXPO_PUBLIC_MSG91_WIDGET_ID ?? ''
export const MSG91_TOKEN_AUTH = process.env.EXPO_PUBLIC_MSG91_TOKEN_AUTH ?? ''

// Google's OAuth client only accepts https:// redirect URIs, so the browser
// flow bounces through this backend route (same origin as API_URL — no
// separate config needed), which forwards into the app via its own
// "mzobs://" scheme. See Backend/src/controllers/googleBridgeController.js.
export const GOOGLE_MOBILE_REDIRECT_BRIDGE_URL = `${API_URL}/mobile/google-callback`
