import axios from 'axios'
import { API_URL } from '../lib/config'

// Real, live per-city × category stats — same public, unauthenticated
// endpoint (GET /api/jobs/hot-cities) Landing-Frontend's "Hot Jobs by City"
// section calls. Hit directly rather than through apiClient since that's
// scoped to /api/employee and this route needs no employee token.
export function getHotCities() {
  return axios.get(`${API_URL}/api/jobs/hot-cities`).then((r) => r.data)
}
