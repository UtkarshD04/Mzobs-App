import { View, TextInput, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

export default function SearchBar({ value, onChangeText, placeholder = 'Search', onFocus, onBlur, autoFocus, style }) {
  const { colors, radius, spacing, fontFamily } = useTheme()

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.md,
          minHeight: 46,
        },
        style,
      ]}
    >
      <Feather name="search" size={16} color={colors.inkTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.inkTertiary}
        accessibilityLabel={placeholder}
        style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 14, padding: 0 }}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear search">
          <Feather name="x-circle" size={16} color={colors.inkTertiary} />
        </Pressable>
      ) : null}
    </View>
  )
}
