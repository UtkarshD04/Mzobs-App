import { OTPWidget } from '@msg91comm/sendotp-react-native'
import { MSG91_WIDGET_ID, MSG91_TOKEN_AUTH } from './config'

// Sends/verifies the phone OTP straight through MSG91's own widget SDK
// (@msg91comm/sendotp-react-native) — same widget the website uses, no
// backend hop for the SMS itself. Verifying returns an access-token that the
// backend then confirms with MSG91 (POST /auth/verify-phone-widget) before
// minting its own phoneToken, so the client can't just claim "verified".
export const WIDGET_CONFIGURED = Boolean(MSG91_WIDGET_ID && MSG91_TOKEN_AUTH)

// Failures from MSG91 arrive as { type: 'error', message } in a normal 200
// body rather than a thrown/HTTP error, so they're rethrown as this type to
// let callers tell them apart from axios errors (which carry .response).
export class WidgetError extends Error {}

if (WIDGET_CONFIGURED) OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH)

function unwrap(response, fallback) {
  if (!response || response.type !== 'success') throw new WidgetError(response?.message || fallback)
  return response
}

// `phone` is the bare 10-digit Indian number; MSG91 wants the country code
// without '+'. With invisible OTP enabled on the widget, the send call can
// verify on its own and hand back an access-token immediately.
export async function sendWidgetOtp(phone) {
  const response = unwrap(await OTPWidget.sendOTP({ identifier: `91${phone}` }), 'Could not send OTP. Please try again.')
  return { reqId: response.message, accessToken: response['access-token'] ?? null }
}

export async function retryWidgetOtp(reqId) {
  unwrap(await OTPWidget.retryOTP({ reqId, retryChannel: 11 }), 'Could not resend OTP. Please try again.')
}

// Resolves with the access-token (in `message`) once MSG91 confirms the code.
export async function verifyWidgetOtp(reqId, otp) {
  const response = unwrap(await OTPWidget.verifyOTP({ reqId, otp }), 'Incorrect or expired OTP.')
  return response.message
}
