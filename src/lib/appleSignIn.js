import { Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'

// "Sign in with Apple" — iOS only (App Store Guideline 4.8 asks for it alongside Google).
export async function isAppleSignInAvailable() {
  if (Platform.OS !== 'ios') return false
  try {
    return await AppleAuthentication.isAvailableAsync()
  } catch {
    return false
  }
}

// Resolves { idToken, name, email } or null when the user cancels. Apple gives the name (and,
// on the first sign-in, the real email) to the app only once — the backend reads the email from
// the signed token and takes the name from here.
export async function appleSignIn() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })
    const { givenName, familyName } = credential.fullName ?? {}
    return {
      idToken: credential.identityToken,
      name: [givenName, familyName].filter(Boolean).join(' '),
      email: credential.email ?? '',
    }
  } catch (err) {
    if (err?.code === 'ERR_REQUEST_CANCELED') return null
    throw err
  }
}
