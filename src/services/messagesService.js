import { apiClient } from '../lib/api'

export function listThreads() {
  return apiClient.get('/messages/threads').then((r) => r.data)
}

export function getThreadMessages(threadId) {
  return apiClient.get(`/messages/threads/${threadId}/messages`).then((r) => r.data)
}

export function sendMessage({ threadId, text }) {
  return apiClient.post(`/messages/threads/${threadId}/messages`, { text }).then((r) => r.data)
}
