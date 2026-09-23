import * as Haptics from 'expo-haptics'

// Thin, fire-and-forget wrappers: haptics are polish, so a missing motor
// (web, simulators, some Android devices) must never surface as an error.
const safe = (fn) => () => {
  try {
    fn()?.catch?.(() => {})
  } catch {}
}

export const tapLight = safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))
export const selectionTick = safe(() => Haptics.selectionAsync())
export const notifySuccess = safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
export const notifyError = safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error))
