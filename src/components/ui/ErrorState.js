import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import Button from './Button'

export default function ErrorState({ title = "Couldn't load this", message = 'Check your internet connection and try again.', onRetry, retrying = false }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.redTint, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="wifi-off" size={26} color={colors.red} />
      </View>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 16, marginTop: spacing.md }}>{title}</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4, textAlign: 'center' }}>{message}</Text>
      {onRetry ? <Button title="Try again" onPress={onRetry} loading={retrying} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} /> : null}
    </View>
  )
}
