import { apiClient } from '../lib/api'

export function listNotifications() {
  return apiClient.get('/notifications').then((r) => r.data)
}

export function markNotificationRead(id) {
  return apiClient.patch(`/notifications/${id}/read`).then((r) => r.data)
}

export function markAllNotificationsRead() {
  return apiClient.patch('/notifications/read-all').then((r) => r.data)
}
