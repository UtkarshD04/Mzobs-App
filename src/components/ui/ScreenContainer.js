import { ScrollView, View, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../theme'

export default function ScreenContainer({ children, scroll = true, onRefresh, refreshing = false, header, footer, style }) {
  const { colors, spacing } = useTheme()
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[{ padding: spacing.lg, paddingBottom: spacing.xxl }, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: spacing.lg }, style]}>{children}</View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {header}
      {content}
      {footer}
    </SafeAreaView>
  )
}
