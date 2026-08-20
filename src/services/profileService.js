import { apiClient } from '../lib/api'

export function getProfile() {
  return apiClient.get('/profile').then((r) => r.data)
}

export function updateProfile(input) {
  return apiClient.put('/profile', input).then((r) => r.data)
}
