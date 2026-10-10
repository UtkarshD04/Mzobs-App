import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { queryClient, queryKeys } from '../../lib/queryClient'
import { navigationRef } from '../../lib/navigation'
import { syncPushToken } from '../../lib/pushNotifications'
import { getPlan } from '../../services/subscriptionService'

// Wires incoming pushes into the app (mounted only while signed in):
//  - a push arriving while the app is open refreshes the Notifications list + badge
//  - tapping a push opens the right screen, including when it launched the app
//  - if the OS rotates this phone's push token, the new one is registered
const handled = new Set()

// Premium service updates are sent under the shared "training" category with
// the service's label as the title, so match against the cached plan to land
// on the Subscription screen (where the requests live) instead of the list.
async function isServiceUpdate(category, title) {
  if (category !== 'training' || !title) return false
  const plan = await queryClient.ensureQueryData({ queryKey: queryKeys.plan, queryFn: getPlan }).catch(() => null)
  return !!plan?.services?.some((s) => s.label === title)
}

async function screenFor(category, title) {
  if (category === 'applications') return ['Main', { screen: 'Applications' }]
  if (await isServiceUpdate(category, title)) return ['Subscription', undefined]
  return ['Notifications', undefined]
}

// getLastNotificationResponseAsync() keeps returning the same response on
// every cold start (not just the launch that was actually a notification
// tap) until clearLastNotificationResponseAsync() has run to completion —
// if the app gets killed before that clear finishes, a stale tap replays
// and force-navigates to Notifications on a perfectly normal app open. A
// response older than this is never treated as "this launch was a tap."
const STALE_RESPONSE_MS = 15_000

async function open(response) {
  const id = response?.notification?.request?.identifier
  if (id && handled.has(id)) return
  if (id) handled.add(id)

  queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
  const content = response?.notification?.request?.content
  const [name, params] = await screenFor(content?.data?.category, content?.title)
  if (navigationRef.isReady()) navigationRef.navigate(name, params)
  Notifications.clearLastNotificationResponseAsync?.().catch(() => {})
}

function isFreshLaunchTap(response) {
  const date = response?.notification?.date
  if (!date) return false
  // expo-notifications reports `date` in seconds on Android, ms on iOS.
  const ms = date > 1e12 ? date : date * 1000
  return Date.now() - ms < STALE_RESPONSE_MS
}

export default function PushListeners() {
  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    })
    const tapped = Notifications.addNotificationResponseReceivedListener(open)
    const tokenChanged = Notifications.addPushTokenListener(() => syncPushToken({ fromListener: true }))

    // App was closed and opened by tapping a notification — but only if that
    // tap actually happened just now, not a stale one left over from before.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response && isFreshLaunchTap(response)) open(response)
        else Notifications.clearLastNotificationResponseAsync?.().catch(() => {})
      })
      .catch(() => {})

    return () => {
      received.remove()
      tapped.remove()
      tokenChanged.remove()
    }
  }, [])

  return null
}
