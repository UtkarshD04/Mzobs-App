import { apiClient } from '../lib/api'

export function getMockInterview() {
  return apiClient.get('/mock-interview').then((r) => r.data)
}
