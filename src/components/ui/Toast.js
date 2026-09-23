import { useEffect } from 'react'
import { Text } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// Small self-dismissing confirmation banner, anchored above the screen's
// footer/tab bar. `message` is falsy -> renders nothing.
export default function Toast({ message, icon = 'check-circle', tone = 'green', onDone, duration = 2200, bottomOffset }) {
  const { colors, radius, spacing, fontFamily } = useTheme()

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onDone?.(), duration)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  const toneColor = tone === 'green' ? colors.green : colors.navy

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        bottom: bottomOffset ?? spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <Feather name={icon} size={18} color={toneColor} />
      <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>{message}</Text>
    </Animated.View>
  )
}
