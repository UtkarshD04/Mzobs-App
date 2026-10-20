// iOS in-app purchase of Mzobs Premium (App Store Guideline 3.1.1) via StoreKit (expo-iap).
// Required lazily — like razorpay.js, the native module isn't in Expo Go. After a purchase the
// app sends Apple's signed transaction to POST /subscription/apple, where the backend verifies
// it against Apple's root certificate and grants Premium (Backend/src/utils/appleTransaction.js).
import { Platform } from 'react-native'

export const iapEnabled = Platform.OS === 'ios'

let sdk = null
let connecting = null

function load() {
  if (!sdk) sdk = require('expo-iap')
  return sdk
}

async function ready() {
  const iap = load()
  if (!connecting) {
    connecting = iap.initConnection().catch((e) => {
      connecting = null
      throw e
    })
  }
  await connecting
  return iap
}

/** The price Apple will actually charge, e.g. '₹499.00'. null when unavailable. */
export async function getStorePrice(productId) {
  try {
    const iap = await ready()
    const products = await iap.fetchProducts({ skus: [productId], type: 'in-app' })
    return products?.find((p) => p.id === productId)?.displayPrice ?? null
  } catch {
    return null
  }
}

/**
 * Opens Apple's payment sheet. Resolves with the signed transaction (JWS) for the backend,
 * plus `finish()` to call once the backend has granted Premium. Rejects { code: 0 } on
 * cancel, { description } otherwise.
 */
export async function buyProduct(productId) {
  let iap
  try {
    iap = await ready()
  } catch {
    throw { code: 'UNAVAILABLE', description: 'The App Store isn’t available right now. Please try again later.' }
  }
  return new Promise((resolve, reject) => {
    let done = false
    const finish = (fn) => (arg) => {
      if (done) return
      done = true
      updated.remove()
      failed.remove()
      fn(arg)
    }
    // StoreKit also replays unfinished transactions through this listener; only react to ours.
    const updated = iap.purchaseUpdatedListener((purchase) => {
      if (purchase?.productId === productId && purchase.purchaseToken) onPurchase(purchase)
    })
    const onPurchase = finish((purchase) => resolve({ signedTransaction: purchase.purchaseToken, finish: () => iap.finishTransaction({ purchase, isConsumable: false }) }))
    const failed = iap.purchaseErrorListener(
      finish((error) =>
        reject(error?.code === 'user-cancelled' ? { code: 0, description: 'Payment cancelled' } : { code: 'STORE', description: error?.message ?? 'The App Store purchase failed.' }),
      ),
    )
    iap.requestPurchase({ request: { apple: { sku: productId } }, type: 'in-app' }).catch(finish((e) => reject({ code: 'STORE', description: e?.message ?? 'The App Store purchase failed.' })))
  })
}

/**
 * Earlier Premium purchases on this Apple ID (new phone / reinstall) as signed transactions,
 * newest first, each with `finish()`. Empty when there are none.
 */
export async function getPurchasedTransactions(productId) {
  const iap = await ready()
  await iap.restorePurchases()
  const purchases = await iap.getAvailablePurchases()
  return (purchases ?? [])
    .filter((p) => p.productId === productId && p.purchaseToken)
    .map((purchase) => ({ signedTransaction: purchase.purchaseToken, finish: () => iap.finishTransaction({ purchase, isConsumable: false }) }))
}
