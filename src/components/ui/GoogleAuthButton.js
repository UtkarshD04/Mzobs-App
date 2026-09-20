import { Pressable, Text, View, ActivityIndicator } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useTheme } from '../../theme'

export function OrDivider({ label = 'or' }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  )
}

export default function GoogleAuthButton({ onPress, label = 'Continue with Google', loading = false, disabled = false }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 999,
        backgroundColor: colors.surface,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <>
          <AntDesign name="google" size={16} color="#DB4437" />
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5 }}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}
