import { Modal, View, Pressable } from 'react-native'
import { WebView } from 'react-native-webview'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Razorpay's Checkout widget needs a DOM/`window`, so unlike the web (which
// calls `window.Razorpay` directly, see Website/Frontend/src/lib/razorpay.js)
// this hosts it in a WebView-rendered page that auto-opens on load and
// reports back over window.ReactNativeWebView.postMessage.
function buildCheckoutHtml(order) {
  const config = {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: order.name,
    description: order.description,
    prefill: order.prefill,
    theme: { color: '#3d5c34' },
  }

  return `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#fff;">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  function post(payload) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload))
  }
  var rzp = new Razorpay(Object.assign({}, ${JSON.stringify(config)}, {
    handler: function (response) { post({ type: 'success', response: response }) },
    modal: { ondismiss: function () { post({ type: 'dismiss' }) } },
  }))
  rzp.on('payment.failed', function (response) {
    post({ type: 'failed', message: (response.error && response.error.description) || 'Payment failed' })
  })
  rzp.open()
</script>
</body>
</html>`
}

export default function RazorpayCheckoutModal({ order, onSuccess, onDismiss, onFail }) {
  const { colors, spacing } = useTheme()

  function handleMessage(event) {
    let payload
    try {
      payload = JSON.parse(event.nativeEvent.data)
    } catch {
      return
    }
    if (payload.type === 'success') onSuccess(payload.response)
    else if (payload.type === 'dismiss') onDismiss()
    else if (payload.type === 'failed') onFail(payload.message)
  }

  return (
    <Modal visible={!!order} animationType="slide" presentationStyle="pageSheet" onRequestClose={onDismiss}>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.sm }}>
          <Pressable onPress={onDismiss} hitSlop={10} style={{ padding: spacing.xs }}>
            <Feather name="x" size={22} color={colors.inkSecondary} />
          </Pressable>
        </View>
        {order ? (
          <WebView
            source={{ html: buildCheckoutHtml(order) }}
            onMessage={handleMessage}
            style={{ flex: 1 }}
          />
        ) : null}
      </View>
    </Modal>
  )
}
