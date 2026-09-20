import { apiClient } from '../lib/api'

export function listJobs(params = {}) {
  return apiClient.get('/jobs', { params }).then((r) => r.data)
}

// The backend caps every list response (50 by default, 200 max) and reports the
// real count in the X-Total-Count header. The app searches and filters on-device,
// so it needs the WHOLE live list, not just the newest page — otherwise older
// openings never show up in search or filters (and Saved Jobs, which is built
// from this same list, would silently lose them). Pages are fetched in parallel
// and de-duplicated in case a job is posted while we're paging.
const PAGE_SIZE = 200
const MAX_PAGES = 10

export async function listAllJobs(params = {}) {
  const first = await apiClient.get('/jobs', { params: { ...params, page: 1, limit: PAGE_SIZE } })
  const total = Number(first.headers?.['x-total-count'])
  const pageCount = Number.isFinite(total) ? Math.min(MAX_PAGES, Math.ceil(total / PAGE_SIZE)) : 1

  let jobs = first.data
  if (pageCount > 1) {
    const rest = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, i) =>
        apiClient.get('/jobs', { params: { ...params, page: i + 2, limit: PAGE_SIZE } }).then((r) => r.data)
      )
    )
    jobs = jobs.concat(...rest)
  }

  const seen = new Set()
  return jobs.filter((job) => (seen.has(job.id) ? false : seen.add(job.id)))
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
