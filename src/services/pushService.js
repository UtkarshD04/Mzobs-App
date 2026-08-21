import { apiClient } from '../lib/api'

export function registerExpoToken(token) {
  return apiClient.post('/push/expo-token', { token })
}
