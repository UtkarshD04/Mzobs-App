import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useProfileQuery } from '../hooks/useProfile'
import { useApplicationsQuery } from '../hooks/useApplications'
import { profileCompletion, recentActivity } from '../lib/dashboard'
import { resumeStatusTone, titleCase } from '../lib/statusTone'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import DashboardSkeleton from '../components/ui/skeletons/DashboardSkeleton'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({ icon, label, value, valueColor, progress, progressTone, footnote }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {label}
        </Text>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon} size={14} color={colors.navy} />
        </View>
      </View>
      <Text style={{ color: valueColor ?? colors.navy, fontFamily: fontFamily.bold, fontSize: 28, marginTop: spacing.sm }}>{value}</Text>
      {progress != null ? <ProgressBar value={progress} tone={progressTone} style={{ marginTop: spacing.sm }} /> : null}
      {footnote ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.sm }}>{footnote}</Text>
      ) : null}
    </Card>
  )
}

export default function DashboardScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { employee } = useAuth()
  const { data: profile, isLoading, refetch, isRefetching } = useProfileQuery()
  const { data: applications = [] } = useApplicationsQuery()

  if (isLoading) return <DashboardSkeleton />

  const completion = profileCompletion(profile)
  const activity = recentActivity(profile, applications)
  const resumeStatus = profile?.resume?.status ?? 'none'
  const firstName = (profile?.name ?? employee?.name ?? '').split(' ')[0]

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 22 }}>
        {greeting()}, {firstName || 'there'}
      </Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4 }}>
        Here's where you stand in the Mzobs placement programme today.
      </Text>

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
        <Button title="Update resume" variant="secondary" onPress={() => navigation.navigate('Resume')} style={{ flex: 1 }} />
        <Button title="Browse openings" onPress={() => navigation.navigate('Jobs')} style={{ flex: 1 }} />
      </View>

      <StatCard
        icon="check-circle"
        label="Profile completion"
        value={`${completion}%`}
        progress={completion}
        footnote={completion < 100 ? 'Complete your profile for better matches' : 'Your profile is complete'}
      />

      <Card style={{ marginTop: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Resume status
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="file-text" size={14} color={colors.navy} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
          <Badge label={titleCase(resumeStatus)} tone={resumeStatusTone[resumeStatus] ?? 'gray'} />
        </View>
        {profile?.resume?.score != null ? (
          <>
            <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 24, marginTop: spacing.sm }}>{profile.resume.score}/100</Text>
            <ProgressBar value={profile.resume.score} tone="gold" style={{ marginTop: spacing.sm }} />
          </>
        ) : (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.sm }}>
            Upload a resume to get a score.
          </Text>
        )}
      </Card>

      <StatCard
        icon="briefcase"
        label="Applications"
        value={applications.length}
        footnote="Total applications sent through Mzobs"
      />

      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.sm }}>
        Recent activity
      </Text>
      {activity.length === 0 ? (
        <Card>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13 }}>Nothing yet — your activity will show up here.</Text>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {activity.map((item, i) => (
            <View
              key={`${item.text}-${i}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors[item.tone === 'green' ? 'greenDot' : 'navy'] }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{item.text}</Text>
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 2 }}>{fmtDate(item.time)}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </ScreenContainer>
  )
}
