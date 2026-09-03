import { apiClient } from '../lib/api'

export function getSubscription() {
  return apiClient.get('/subscription').then((r) => r.data)
}

export function createSubscriptionOrder(couponCode) {
  return apiClient.post('/subscription/order', couponCode ? { couponCode } : {}).then((r) => r.data)
}

// Prices a coupon against the fixed fee without creating an order.
export function previewCoupon(code) {
  return apiClient.post('/subscription/coupon/preview', { code }).then((r) => r.data)
}

export function verifySubscriptionPayment(payload) {
  return apiClient.post('/subscription/verify', payload).then((r) => r.data)
}

// Dev/testing shortcut used when the order came back with mock: true
// (Razorpay isn't configured on the server) — skips the checkout entirely
// and just confirms the simulated order.
export function confirmMockSubscriptionPayment(orderId) {
  return apiClient.post('/subscription/mock-confirm', { orderId }).then((r) => r.data)
}
