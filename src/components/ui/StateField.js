import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { INDIAN_STATES } from '../../lib/profileOptions'
import OptionPicker from './OptionPicker'

export default function StateField({ label = 'State', value, onChange, placeholder = 'Select your state' }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [open, setOpen] = useState(false)
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.sm,
          paddingVertical: 11,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ color: value ? colors.ink : colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 15 }}>{value || placeholder}</Text>
        <Feather name="chevron-down" size={16} color={colors.inkTertiary} />
      </Pressable>
      <OptionPicker visible={open} title={label} options={INDIAN_STATES} selected={value ? [value] : []} onSelect={onChange} onClose={() => setOpen(false)} />
    </View>
  )
}
