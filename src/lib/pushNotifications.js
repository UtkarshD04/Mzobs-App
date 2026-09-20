import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import * as pushService from '../services/pushService'

// Push needs a real phone (emulators have no push service) — everything here
// quietly no-ops on one.
export const PUSH_SUPPORTED = Device.isDevice

// Android 13+ only shows the "Allow notifications?" prompt once a channel exists.
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.HIGH,
  })
}

// Current OS permission WITHOUT prompting.
// status: 'granted' | 'denied' | 'undetermined'; canAskAgain is false once the OS
// will no longer show its prompt (denied twice / "Don't ask again"), leaving phone
// Settings as the only way to turn notifications on.
export async function getNotificationPermission() {
  if (!PUSH_SUPPORTED) return { status: 'unsupported', canAskAgain: false }
  const { status, canAskAgain } = await Notifications.getPermissionsAsync()
  return { status, canAskAgain: canAskAgain !== false }
}

// Shows the OS prompt (when it still can) and returns the resulting permission.
export async function requestNotificationPermission() {
  if (!PUSH_SUPPORTED) return { status: 'unsupported', canAskAgain: false }
  await ensureAndroidChannel()
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync()
  return { status, canAskAgain: canAskAgain !== false }
}

// The device's Expo push token, only if permission is already granted (never prompts).
export async function getExpoPushToken() {
  if (!PUSH_SUPPORTED) return null
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted') return null
  await ensureAndroidChannel()
  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
  return data
}

// Registers this phone's token with the backend so company/staff notifications
// reach it. Best-effort: offline, denied permission or missing FCM setup must
// never get in the way of signing in.
export async function syncPushToken() {
  try {
    const token = await getExpoPushToken()
    if (token) await pushService.registerExpoToken(token)
    return token
  } catch {
    return null
  }
}

// Sign-out: stop this phone receiving the account's notifications. Bounded so a
// bad connection can't hold up logging out.
export async function unregisterPushToken() {
  try {
    const token = await getExpoPushToken()
    if (!token) return
    await Promise.race([pushService.unregisterExpoToken(token), new Promise((resolve) => setTimeout(resolve, 3000))])
  } catch {
    // ignore — the backend also drops the token if another account registers it
  }
}
