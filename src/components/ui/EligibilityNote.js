import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import Card from './Card'
import Button from './Button'

// Free-plan lifetime application cap — mirrors Backend's
// FREE_APPLICATION_LIMIT (employeeApplicationController.js). Premium
// (subscription.status === 'paid', i.e. profile.isPremium) is unlimited.
export const FREE_APPLICATION_LIMIT = 5

// Explains why applying is locked — matches the website's ApplyPanel.jsx,
// which gates applying on a verified resume (and, for free accounts, the
// application cap below). Shared by JobListScreen (browse-time banner) and
// JobDetailScreen (apply-time banner).
export default function EligibilityNote({ verified, limitReached, navigation, style }) {
  const { colors, spacing, fontFamily } = useTheme()
  if (verified && !limitReached) return null

  return (
    <Card style={[{ backgroundColor: colors.navyTint, borderColor: colors.navyTintStrong }, style]}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <Feather name={limitReached ? 'award' : 'shield'} size={16} color={colors.navy} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>
            {limitReached ? "You've used all 5 free applications" : 'Add your resume to start applying'}
          </Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 3, lineHeight: 17 }}>
            {limitReached
              ? 'Free accounts can apply to up to 5 jobs. Upgrade to premium for unlimited applications.'
              : 'Upload your resume in Resume Center to unlock applications. It is verified instantly.'}
          </Text>
          {limitReached && navigation ? (
            <Button title="Upgrade to premium" variant="gold" onPress={() => navigation.navigate('Subscription')} style={{ marginTop: spacing.sm }} />
          ) : null}
          {!limitReached && !verified && navigation ? (
            <Button title="Upload resume" onPress={() => navigation.navigate('Main', { screen: 'Resume' })} style={{ marginTop: spacing.sm }} />
          ) : null}
        </View>
      </View>
    </Card>
  )
}
