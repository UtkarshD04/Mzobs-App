import { apiClient } from '../lib/api'

// Logs an *existing* account in using nothing but a verified phoneToken — no
// password. Rejects with a 404 (via the axios error) when no account exists
// for that phone number yet, which the phone-first auth flow reads as "show
// the signup details step" rather than a real error.
export function phoneLogin(phone, phoneToken) {
  return apiClient.post('/auth/phone-login', { phone, phoneToken }).then((r) => r.data)
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

// Exchanges the MSG91 widget's client-verified access-token for our own
// short-lived phoneToken (the backend confirms the token with MSG91 first).
export function verifyPhoneWidget(phone, accessToken) {
  return apiClient.post('/auth/verify-phone-widget', { phone, accessToken }).then((r) => r.data)
}

export function getMe() {
  return apiClient.get('/auth/me').then((r) => r.data)
}

export function forgotPassword(email) {
  return apiClient.post('/auth/forgot-password', { email }).then((r) => r.data)
}

// Email sign-in: send a code, verify it (returns a short-lived emailToken), then
// emailLogin opens the account for that address (404 = none yet -> sign up).
export function sendEmailOtp(email) {
  return apiClient.post('/auth/send-email-otp', { email }).then((r) => r.data)
}

export function verifyEmailOtp(email, otp) {
  return apiClient.post('/auth/verify-email-otp', { email, otp }).then((r) => r.data)
}

export function emailLogin(email, emailToken) {
  return apiClient.post('/auth/email-login', { email, emailToken }).then((r) => r.data)
}
