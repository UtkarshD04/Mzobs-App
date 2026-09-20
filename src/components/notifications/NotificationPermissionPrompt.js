import { useEffect, useState } from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useNotificationPermission } from '../../hooks/useNotificationPermission'
import Button from '../ui/Button'

// Explains WHY before the phone's own "Allow notifications?" prompt, so people say
// yes to it (and so declining here never burns the one-shot OS prompt). Shown once
// after sign-in while the permission is still undecided; "Not now" is remembered and
// it comes back at most once every two weeks. Settings and the Notifications screen
// always offer the switch too.
const DISMISSED_KEY = 'mzobs-push-prompt-dismissed-at'
const REPROMPT_AFTER_MS = 14 * 24 * 60 * 60 * 1000
const SHOW_DELAY_MS = 1500

async function recentlyDismissed() {
  try {
    const at = Number(await SecureStore.getItemAsync(DISMISSED_KEY))
    return Number.isFinite(at) && at > 0 && Date.now() - at < REPROMPT_AFTER_MS
  } catch {
    return false
  }
}

export default function NotificationPermissionPrompt() {
  const { colors, spacing, radius, fontFamily } = useTheme()
  const { status, canAskAgain, enable } = useNotificationPermission()
  const [visible, setVisible] = useState(false)

  const shouldAsk = status === 'undetermined' || (status === 'denied' && canAskAgain)

  useEffect(() => {
    if (!shouldAsk) {
      setVisible(false)
      return undefined
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      if (!cancelled && !(await recentlyDismissed())) setVisible(true)
    }, SHOW_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [shouldAsk])

  async function handleAllow() {
    setVisible(false)
    await enable()
  }

  async function handleNotNow() {
    setVisible(false)
    try {
      await SecureStore.setItemAsync(DISMISSED_KEY, String(Date.now()))
    } catch {
      // not being able to remember it just means we may ask again sooner
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleNotNow} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(15,35,56,0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <View style={{ width: '100%', maxWidth: 380, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl }}>
          <View style={{ width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="bell" size={22} color={colors.navy} />
          </View>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 19, marginTop: spacing.lg }}>Turn on notifications?</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }}>
            Get an alert the moment an employer views or shortlists you, invites you to an interview, or sends you a message, and when Mzobs has news about your applications.
          </Text>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.sm }}>
            You can change this anytime in Settings.
          </Text>
          <Button title="Turn on notifications" onPress={handleAllow} style={{ marginTop: spacing.xl }} />
          <Pressable onPress={handleNotNow} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'center', paddingVertical: spacing.md, marginTop: spacing.xs }}>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 14 }}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
