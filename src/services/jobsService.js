import { apiClient } from '../lib/api'

export function listJobs(params = {}) {
  return apiClient.get('/jobs', { params }).then((r) => r.data)
}

export function getJob(id) {
  return apiClient.get(`/jobs/${id}`).then((r) => r.data)
}

export function listRecommendedJobs() {
  return apiClient.get('/jobs/recommended').then((r) => r.data)
}

export function listAppliedBasedJobs() {
  return apiClient.get('/jobs/based-on-applies').then((r) => r.data)
}

export function listInstantHiringJobs() {
  return apiClient.get('/jobs/instant-hiring').then((r) => r.data)
}
