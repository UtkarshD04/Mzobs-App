import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { queryClient, queryKeys } from '../../lib/queryClient'
import { navigationRef } from '../../lib/navigation'
import { syncPushToken } from '../../lib/pushNotifications'

// Wires incoming pushes into the app (mounted only while signed in):
//  - a push arriving while the app is open refreshes the Notifications list + badge
//  - tapping a push opens the right screen, including when it launched the app
//  - if the OS rotates this phone's push token, the new one is registered
const handled = new Set()

function screenFor(category) {
  return category === 'applications' ? ['Main', { screen: 'Applications' }] : ['Notifications', undefined]
}

function open(response) {
  const id = response?.notification?.request?.identifier
  if (id && handled.has(id)) return
  if (id) handled.add(id)

  queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
  const [name, params] = screenFor(response?.notification?.request?.content?.data?.category)
  if (navigationRef.isReady()) navigationRef.navigate(name, params)
  Notifications.clearLastNotificationResponseAsync?.().catch(() => {})
}

export default function PushListeners() {
  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications })
    })
    const tapped = Notifications.addNotificationResponseReceivedListener(open)
    const tokenChanged = Notifications.addPushTokenListener(() => syncPushToken())

    // App was closed and opened by tapping a notification.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => response && open(response))
      .catch(() => {})

    return () => {
      received.remove()
      tapped.remove()
      tokenChanged.remove()
    }
  }, [])

  return null
}
