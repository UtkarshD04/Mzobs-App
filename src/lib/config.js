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
  // The iOS Simulator shares the Mac's own network stack, so routing back out
  // through the Mac's LAN IP can silently fail (local NAT/firewall hairpin) —
  // `localhost` always reaches it directly since it's the same machine.
  if (Platform.OS === 'ios' && !Device.isDevice) host = 'localhost'
  return host ? `http://${host}:${BACKEND_PORT}` : null
}

const FALLBACK_API_URL = 'http://localhost:4000'

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getDevServerApiUrl() ?? FALLBACK_API_URL
export const API_BASE = `${API_URL}/api/employee`
export const FILE_BASE_URL = API_URL
