import { useEffect, useState } from 'react'
import { AppState, Linking, Platform, Text, View } from 'react-native'
import axios from 'axios'
import Constants from 'expo-constants'
import { API_URL } from '../lib/config'
import { useTheme } from '../theme'
import BrandLogo from './ui/BrandLogo'
import Button from './ui/Button'

const PLAY_STORE_URL = 'market://details?id=com.mzobs.app'
const PLAY_STORE_WEB_URL = 'https://play.google.com/store/apps/details?id=com.mzobs.app'

const currentVersionCode = Number(Constants.expoConfig?.android?.versionCode ?? 0)

// Blocks the whole app when the backend's minimum Android versionCode is above this build's.
// Fails open: if the check can't reach the server, the app just runs.
export default function UpdateGate({ children }) {
  const { colors, spacing, fontFamily } = useTheme()
  const [mustUpdate, setMustUpdate] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'android' || !currentVersionCode) return
    let cancelled = false
    const check = () =>
      axios
        .get(`${API_URL}/api/app-config`, { timeout: 8000 })
        .then(({ data }) => {
          if (!cancelled) setMustUpdate(currentVersionCode < Number(data?.android?.minVersionCode ?? 0))
        })
        .catch(() => {})
    check()
    const sub = AppState.addEventListener('change', (state) => state === 'active' && check())
    return () => {
      cancelled = true
      sub.remove()
    }
  }, [])

  if (!mustUpdate) return children

  const openStore = () => Linking.openURL(PLAY_STORE_URL).catch(() => Linking.openURL(PLAY_STORE_WEB_URL))

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 32, gap: 16 }}>
      <BrandLogo height={30} />
      <Text style={{ fontFamily: fontFamily.bold, fontSize: 22, color: colors.ink, textAlign: 'center' }}>Update required</Text>
      <Text style={{ fontFamily: fontFamily.regular, fontSize: 15, color: colors.inkSecondary, textAlign: 'center' }}>
        A new version of MZOBS is available. Please update the app to continue.
      </Text>
      <Button title="Update now" onPress={openStore} style={{ alignSelf: 'stretch', marginTop: 8 }} />
    </View>
  )
}
