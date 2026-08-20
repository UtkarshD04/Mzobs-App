import { apiClient } from '../lib/api'

export function listApplications() {
  return apiClient.get('/applications').then((r) => r.data)
}

export function applyToJob(jobId) {
  return apiClient.post('/applications', { jobId }).then((r) => r.data)
}
