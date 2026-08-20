import { View, ActivityIndicator } from 'react-native'
import { useTheme } from '../../theme'

export default function LoadingSpinner() {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
      <ActivityIndicator size="large" color={colors.navy} />
    </View>
  )
}
