import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

export default function EmptyState({ icon = 'inbox', title, message }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.navyTint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={icon} size={26} color={colors.navy} />
      </View>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 16, marginTop: spacing.md }}>{title}</Text>
      {message ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4, textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
    </View>
  )
}
