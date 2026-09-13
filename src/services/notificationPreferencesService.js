import { apiClient } from '../lib/api'

export function getNotificationPreferences() {
  return apiClient.get('/notification-preferences').then((r) => r.data)
}

export function updateNotificationPreferences(input) {
  return apiClient.put('/notification-preferences', input).then((r) => r.data)
}
