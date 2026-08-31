import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import Card from './Card'
import Button from './Button'

// Explains why applying is locked and, once paid, what's still missing.
// Shared by JobListScreen (browse-time banner) and JobDetailScreen (apply-time banner).
export default function EligibilityNote({ paid, verified, fee = 299, navigation, style }) {
  const { colors, spacing, fontFamily } = useTheme()
  if (paid && verified) return null

  return (
    <Card
      style={[
        { backgroundColor: paid ? colors.navyTint : colors.goldTint, borderColor: paid ? colors.navyTintStrong : colors.goldTint },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <Feather name={paid ? 'shield' : 'lock'} size={16} color={paid ? colors.navy : colors.goldStrong} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>
            {!paid ? 'Activate placement support to unlock applications' : 'Finish verification to unlock applications'}
          </Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 3, lineHeight: 17 }}>
            {!paid
              ? `A one-time ₹${fee} payment unlocks resume upload, verification, and applying to openings.`
              : 'Applications open once your resume is verified by the Mzobs team.'}
          </Text>
        </View>
      </View>
      {!paid ? (
        <Button title={`Pay ₹${fee} & activate`} variant="gold" onPress={() => navigation.navigate('Subscription')} style={{ marginTop: spacing.md }} />
      ) : null}
    </Card>
  )
}
