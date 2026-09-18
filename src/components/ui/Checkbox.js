import { Pressable, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

export default function Checkbox({ checked, onChange, children }) {
  const { colors, spacing, radius } = useTheme()
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}
      hitSlop={4}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.sm ?? 4,
          borderWidth: 1.5,
          borderColor: checked ? colors.navy : colors.border,
          backgroundColor: checked ? colors.navy : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        {checked ? <Feather name="check" size={13} color="#ffffff" /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  )
}
