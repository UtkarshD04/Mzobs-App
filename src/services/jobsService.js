import { apiClient } from '../lib/api'

export function listJobs(params = {}) {
  return apiClient.get('/jobs', { params }).then((r) => r.data)
}

export function getJob(id) {
  return apiClient.get(`/jobs/${id}`).then((r) => r.data)
}
