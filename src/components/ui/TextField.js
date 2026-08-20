import { View, Text, TextInput } from 'react-native'
import { useTheme } from '../../theme'

export default function TextField({ label, error, style, inputStyle, multiline, ...inputProps }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.inkTertiary}
        multiline={multiline}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.red : colors.border,
            borderRadius: radius.md,
            paddingVertical: 11,
            paddingHorizontal: spacing.md,
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
      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  )
}
