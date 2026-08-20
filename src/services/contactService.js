import axios from 'axios'
import { API_URL } from '../lib/config'

// Mounted at /api/contact (outside /api/employee) and needs no auth — this
// is the one real "send a message to Mzobs" endpoint that exists today, so
// both the Support form and the Interview Center's reschedule request route
// through it instead of a fake local modal.
export function submitContactMessage(input) {
  return axios.post(`${API_URL}/api/contact`, input).then((r) => r.data)
}
