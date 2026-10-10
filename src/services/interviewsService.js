import { apiClient } from '../lib/api'

// Interviews employers have scheduled with this candidate (soonest first).
export function listInterviews() {
  return apiClient.get('/interviews').then((r) => r.data)
}

// The latest MZOBS mock interview — { status: 'not_scheduled' } when none.
export function getMockInterview() {
  return apiClient.get('/mock-interview').then((r) => r.data)
}
