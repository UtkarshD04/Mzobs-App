import { apiClient } from '../lib/api'

// Phase 2 mirrors the web Subscription page as a status/history view only —
// the web page itself has no "pay now" button either; the ₹99 fee is
// collected during the Landing-Frontend signup flow, not from this screen.
export function getSubscription() {
  return apiClient.get('/subscription').then((r) => r.data)
}
