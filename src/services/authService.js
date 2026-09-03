import { apiClient } from '../lib/api'

export function login(email, password) {
  return apiClient.post('/auth/login', { email, password }).then((r) => r.data)
}

export function signup(input) {
  return apiClient.post('/auth/signup', input).then((r) => r.data)
}

export function sendOtp(phone) {
  return apiClient.post('/auth/send-otp', { phone }).then((r) => r.data)
}

export function verifyOtp(phone, otp) {
  return apiClient.post('/auth/verify-otp', { phone, otp }).then((r) => r.data)
}

export function getMe() {
  return apiClient.get('/auth/me').then((r) => r.data)
}

export function forgotPassword(email) {
  return apiClient.post('/auth/forgot-password', { email }).then((r) => r.data)
}
