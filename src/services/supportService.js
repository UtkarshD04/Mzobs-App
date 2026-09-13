import { apiClient } from '../lib/api'

export function listTickets() {
  return apiClient.get('/support/tickets').then((r) => r.data)
}

export function submitTicket(input) {
  return apiClient.post('/support/tickets', input).then((r) => r.data)
}
