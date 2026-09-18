import RazorpayCheckout from 'react-native-razorpay'

// Native Razorpay Checkout SDK — replaces an earlier WebView + checkout.js
// approach (RazorpayCheckoutModal.js, now removed). That approach hosted
// Razorpay's *web* widget inside a WebView, which Razorpay doesn't support
// for React Native: instead of showing the full method-selection screen
// (cards/netbanking/wallets/UPI), it would collapse straight into a UPI
// intent and launch whichever app (e.g. Google Pay) handled it first. The
// native SDK renders Razorpay's real checkout UI with every method visible.
//
// Resolves with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
// on success; rejects with { code, description } on cancel/failure (code 0
// is a user-initiated cancel — see SubscriptionScreen.js's handling of it).
export function openRazorpayCheckout(order) {
  return RazorpayCheckout.open({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: order.name,
    description: order.description,
    prefill: order.prefill,
    theme: { color: '#2563EB' },
  })
}
