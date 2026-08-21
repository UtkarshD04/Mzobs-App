import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

export default function TextField({
  label,
  error,
  style,
  inputStyle,
  multiline,
  secureTextEntry,
  autoCapitalize,
  autoCorrect,
  ...inputProps
}) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [revealed, setRevealed] = useState(false)
  const isPasswordField = !!secureTextEntry

  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{label}</Text>
      ) : null}
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={colors.inkTertiary}
          multiline={multiline}
          secureTextEntry={isPasswordField && !revealed}
          autoCapitalize={autoCapitalize ?? (isPasswordField ? 'none' : 'sentences')}
          autoCorrect={autoCorrect ?? !isPasswordField}
          style={[
            {
              borderWidth: 1,
              borderColor: error ? colors.red : colors.border,
              borderRadius: radius.md,
              paddingVertical: 11,
              paddingHorizontal: spacing.md,
              paddingRight: isPasswordField ? 44 : spacing.md,
              color: colors.ink,
              fontFamily: fontFamily.regular,
              fontSize: 15,
              backgroundColor: colors.surface,
            },
            multiline && { minHeight: 100, textAlignVertical: 'top' },
            inputStyle,
          ]}
          {...inputProps}
        />
        {isPasswordField ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            style={{ position: 'absolute', right: spacing.md, padding: 4 }}
          >
            <Feather name={revealed ? 'eye-off' : 'eye'} size={18} color={colors.inkTertiary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  )
}
