const fs = require('fs')
const path = require('path')

// app.json remains the source of truth for the rest of the Expo/Android
// config (permissions, plugins, etc) — this file only layers a build-time
// safety check on top of it. Expo evaluates this during `expo prebuild`,
// `expo start`, and every `eas build`, so a misconfigured production API
// URL fails the build/config instead of silently shipping a broken or
// insecure app.
module.exports = ({ config }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? ''
  // Set automatically by EAS Build to the profile name from eas.json
  // ("development" | "preview" | "production"); undefined for a local
  // `expo start`/`expo prebuild`, which this check intentionally leaves
  // alone — local dev against localhost/a LAN IP over http is expected.
  const profile = process.env.EAS_BUILD_PROFILE
  const isPlainHttp = apiUrl.startsWith('http://')
  const isLocalOrLan = /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:|\/|$)/.test(apiUrl)

  if (profile === 'production') {
    if (!apiUrl) {
      throw new Error(
        'EXPO_PUBLIC_API_URL is not set for the "production" EAS build profile — the shipped app would fall back to http://localhost:4000 at runtime. Set it (see eas.json) before building.'
      )
    }
    if (isPlainHttp) {
      throw new Error(
        `EXPO_PUBLIC_API_URL ("${apiUrl}") must be https:// for the "production" EAS build profile — a plain http:// API URL would send auth tokens, resumes and payment data unencrypted.`
      )
    }
  }

  if (profile === 'preview' && isPlainHttp && !isLocalOrLan) {
    console.warn(
      `[app.config.js] WARNING: "preview" build has EXPO_PUBLIC_API_URL ("${apiUrl}") set to a non-local http:// address. Preview builds are installed on real devices over the internet — this should almost always be https://.`
    )
  }

  // Android push notifications are delivered through Firebase Cloud Messaging, which needs
  // this project's google-services.json (Firebase console -> Project settings -> Your apps).
  // Use a local file next to app.json, or an EAS "file" environment variable named
  // GOOGLE_SERVICES_JSON so the file never has to be committed. Without it the build still
  // works, but the phone can never get a push token (in-app notifications keep working).
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON ?? (fs.existsSync(path.join(__dirname, 'google-services.json')) ? './google-services.json' : null)
  if (googleServicesFile) {
    config.android = { ...config.android, googleServicesFile }
  } else if (profile === 'production') {
    console.warn(
      '[app.config.js] WARNING: no google-services.json (or GOOGLE_SERVICES_JSON) for this "production" build — Android push notifications will NOT work until it is added.'
    )
  }

  return config
}
