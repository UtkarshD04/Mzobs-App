import { apiClient } from '../lib/api'

export function listInterviews() {
  return apiClient.get('/interviews').then((r) => r.data)
}
