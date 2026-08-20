import Constants from 'expo-constants'

const BACKEND_PORT = 4000

// Expo Go / native builds can't reach a bare "localhost" the way a browser
// tab can. Instead of hardcoding the machine's LAN IP (which changes across
// networks/reboots and goes stale), derive it from the Metro dev server host
// that Expo Go already connected to — same machine, so same LAN IP.
function getDevServerApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost
  const host = hostUri?.split(':')[0]
  return host ? `http://${host}:${BACKEND_PORT}` : null
}

const FALLBACK_API_URL = 'http://localhost:4000'

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getDevServerApiUrl() ?? FALLBACK_API_URL
export const API_BASE = `${API_URL}/api/employee`
export const FILE_BASE_URL = API_URL
