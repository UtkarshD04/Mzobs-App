import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import Card from './Card'

// Explains why applying is locked — matches the website's ApplyPanel.jsx,
// which gates applying on a verified resume only (no subscription/payment
// requirement). Shared by JobListScreen (browse-time banner) and
// JobDetailScreen (apply-time banner).
export default function EligibilityNote({ verified, style }) {
  const { colors, spacing, fontFamily } = useTheme()
  if (verified) return null

  return (
    <Card style={[{ backgroundColor: colors.navyTint, borderColor: colors.navyTintStrong }, style]}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <Feather name="shield" size={16} color={colors.navy} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>Finish verification to unlock applications</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 3, lineHeight: 17 }}>
            Applications open once your resume is verified by the Mzobs team.
          </Text>
        </View>
      </View>
    </Card>
  )
}
