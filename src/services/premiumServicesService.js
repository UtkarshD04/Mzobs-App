import { apiClient } from '../lib/api'

// The signed-in candidate's Premium service requests, newest first.
export function listServiceRequests() {
  return apiClient.get('/premium-services').then((r) => r.data)
}

export function requestService({ service, note, preferredTime }) {
  return apiClient.post('/premium-services', { service, note, preferredTime }).then((r) => r.data)
}

// Only allowed while the request is still "requested" (before the team picks it up).
export function cancelServiceRequest(id) {
  return apiClient.patch(`/premium-services/${encodeURIComponent(id)}/cancel`).then((r) => r.data)
}
