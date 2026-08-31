import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useSubscriptionQuery } from '../hooks/useSubscription'
import { useProfileQuery } from '../hooks/useProfile'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const UNLOCKS = [
  ['shield', 'Resume verification', 'Line-by-line review before any employer sees it.', 'navy'],
  ['video', 'Mock interview with our panel', 'A real interview round, with written feedback and a score.', 'gold'],
  ['layers', 'Skill track assignment', "Placed in the track that matches your strengths.", 'violet'],
  ['send', 'Profile dispatch to employers', 'We shortlist and send your resume when a match opens.', 'teal'],
  ['book-open', 'Training & assessments', 'Courses, practice tests and live sessions for your track.', 'amber'],
  ['message-square', 'Placement desk support', 'A direct line to the Mzobs team through your search.', 'green'],
]

const NEVER_CHARGED = [
  ['Applying to a job', 'Every requirement on your portal is free to apply to.'],
  ['Being shortlisted', 'Employers pay Mzobs for shortlists — you never do.'],
  ['Getting placed', 'No success fee, no cut of your salary. Ever.'],
]

export default function SubscriptionScreen() {
  const { colors, spacing, fontFamily, radius } = useTheme()
  const { data: subscription, isLoading: l1, refetch, isRefetching } = useSubscriptionQuery()
  const { data: profile, isLoading: l2 } = useProfileQuery()

  if (l1 || l2) return <LoadingSpinner />

  const fee = subscription.amount ?? 299
  const isPaid = subscription.status === 'paid'

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Subscription</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4, marginBottom: spacing.lg }}>
        Your one-time ₹{fee} Placement Support Programme.
      </Text>

      <View style={{ backgroundColor: colors.navy900, borderRadius: radius.xl, padding: spacing.lg }}>
        <Badge label={isPaid ? 'Active' : 'Inactive'} tone={isPaid ? 'green' : 'red'} />
        <Text style={{ color: '#ffffff', fontFamily: fontFamily.bold, fontSize: 19, marginTop: spacing.sm }}>Placement Support Programme</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 6 }}>
          {subscription.paidOn ? `Purchased ${fmtDate(subscription.paidOn)} · ` : ''}One-time payment · No renewal
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 2 }}>Candidate ID {profile.id}</Text>
        <Text style={{ color: '#ffffff', fontFamily: fontFamily.bold, fontSize: 26, marginTop: spacing.md }}>₹{fee}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: fontFamily.regular, fontSize: 11 }}>Paid once, valid for life</Text>
      </View>

      <Card style={{ marginTop: spacing.lg, backgroundColor: colors.goldTint, borderColor: colors.goldTint }}>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
          <Feather name="info" size={18} color={colors.goldStrong} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>This is placement support, not a job guarantee</Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4, lineHeight: 18 }}>
              The ₹{fee} fee covers verification, a mock interview, training and getting your resume in front of hiring companies. Whether you're
              selected is the employer's call — we never charge you again.
            </Text>
          </View>
        </View>
      </Card>

      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 17, marginTop: spacing.xl, marginBottom: spacing.md }}>
        What your ₹{fee} unlocks
      </Text>
      {UNLOCKS.map(([icon, title, desc, tone]) => (
        <Card key={title} style={{ marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors[`${tone}Tint`], alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={icon} size={16} color={colors[tone === 'gold' ? 'goldStrong' : tone]} />
            </View>
            <Feather name="check" size={15} color={colors.green} />
          </View>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginTop: spacing.sm }}>{title}</Text>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 3, lineHeight: 17 }}>{desc}</Text>
        </Card>
      ))}

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>You'll never be charged for</Text>
        {NEVER_CHARGED.map(([t, b], i) => (
          <View key={t} style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: i === NEVER_CHARGED.length - 1 ? 0 : spacing.md }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Feather name="check" size={12} color={colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{t}</Text>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 2 }}>{b}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>Payment history</Text>
        {isPaid ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 12.5 }}>Mzobs placement programme — one-time fee</Text>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 2 }}>{fmtDate(subscription.paidOn)}</Text>
            </View>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 13, marginRight: spacing.sm }}>₹{fee}</Text>
            <Badge label="Paid" tone="green" />
          </View>
        ) : (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>No payment recorded yet.</Text>
        )}
      </Card>
    </ScreenContainer>
  )
}
