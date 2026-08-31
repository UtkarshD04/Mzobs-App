import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useProfileQuery } from '../hooks/useProfile'
import { useApplicationsQuery } from '../hooks/useApplications'
import { useInterviewsQuery } from '../hooks/useInterviews'
import { useJobsQuery } from '../hooks/useJobs'
import { useSubscriptionQuery } from '../hooks/useSubscription'
import { profileCompletion, recentActivity } from '../lib/dashboard'
import { resumeStatusTone, titleCase } from '../lib/statusTone'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import DashboardSkeleton from '../components/ui/skeletons/DashboardSkeleton'

const APPLICATION_STAGE_INDEX = { new: 1, screening: 2, shortlisted: 3, shared: 4, interview: 5, selected: 6, rejected: 6 }
const ACTIVITY_DOT = { green: 'greenDot', gold: 'goldDot', navy: 'navy' }

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

function SectionHeader({ title, action, onAction }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.sm }}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 }}>{title}</Text>
      {action ? (
        <Text onPress={onAction} style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>
          {action}
        </Text>
      ) : null}
    </View>
  )
}

export default function DashboardScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { employee } = useAuth()
  const { data: profile, isLoading, refetch, isRefetching } = useProfileQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const { data: interviews = [] } = useInterviewsQuery()
  const { data: jobs = [] } = useJobsQuery()
  const { data: subscription } = useSubscriptionQuery()

  if (isLoading) return <DashboardSkeleton />

  const completion = profileCompletion(profile)
  const activity = recentActivity(profile, applications)
  const resumeStatus = profile?.resume?.status ?? 'none'
  const firstName = (profile?.name ?? employee?.name ?? '').split(' ')[0]

  const track = profile?.skillTrack?.key
  const trackJobs = (track ? jobs.filter((j) => j.track === track) : jobs).slice(0, 3)
  const upcomingInterview = interviews
    .filter((i) => ['Confirmed', 'Awaiting confirmation'].includes(i.status))
    .sort((a, b) => new Date(a.when) - new Date(b.when))[0]
  const isPaid = subscription?.status === 'paid'
  const fee = subscription?.amount ?? 299

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

      <Pressable onPress={() => navigation.navigate('Subscription')}>
        <Card style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Subscription
            </Text>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="credit-card" size={14} color={colors.navy} />
            </View>
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <Badge label={isPaid ? 'Active' : 'Inactive'} tone={isPaid ? 'navy' : 'gold'} />
          </View>
          <Text style={{ color: isPaid ? colors.inkTertiary : colors.goldStrong, fontFamily: fontFamily.semibold, fontSize: 12.5, marginTop: spacing.sm }}>
            {isPaid ? `${subscription?.paidOn ? `Paid ${fmtDate(subscription.paidOn)} · ` : ''}₹${fee} one-time` : `Pay ₹${fee} to activate →`}
          </Text>
        </Card>
      </Pressable>

      <SectionHeader title="Application status" action="Track all" onAction={() => navigation.navigate('Applications')} />
      <Card style={{ padding: 0 }}>
        {applications.length === 0 ? (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, padding: spacing.lg }}>
            You haven't applied to any openings yet.
          </Text>
        ) : (
          applications.slice(0, 3).map((a, i) => {
            const stage = APPLICATION_STAGE_INDEX[a.status] ?? 1
            return (
              <View
                key={a.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{a.job?.title ?? 'Role'}</Text>
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 3 }}>
                    Applied {fmtDate(a.appliedOn)}
                  </Text>
                </View>
                {a.status === 'selected' ? (
                  <Badge label="Selected" tone="green" />
                ) : a.status === 'rejected' ? (
                  <Badge label="Not selected" tone="red" />
                ) : stage >= 4 ? (
                  <Badge label="With employer" tone="gold" />
                ) : (
                  <Badge label="With Mzobs" tone="navy" />
                )}
              </View>
            )
          })
        )}
      </Card>

      <SectionHeader title="Interview scheduled" action="Details" onAction={() => navigation.navigate('InterviewCenter')} />
      <Card>
        {upcomingInterview ? (
          <>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>{upcomingInterview.company}</Text>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 2 }}>{upcomingInterview.role}</Text>
            <View style={{ marginTop: spacing.md, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="clock" size={13} color={colors.inkTertiary} />
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>
                  {upcomingInterview.when ? new Date(upcomingInterview.when).toLocaleString('en-IN') : '—'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="video" size={13} color={colors.inkTertiary} />
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>
                  {upcomingInterview.mode ?? (upcomingInterview.location ? 'On-site' : '—')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="flag" size={13} color={colors.inkTertiary} />
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>{upcomingInterview.round || '—'}</Text>
              </View>
            </View>
            <Button title="Open Interview Center" onPress={() => navigation.navigate('InterviewCenter')} style={{ marginTop: spacing.lg }} />
          </>
        ) : (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13 }}>
            No interview scheduled yet — this shows up once an employer wants to meet you.
          </Text>
        )}
      </Card>

      <SectionHeader title={track ? 'Openings in your track' : 'Openings for you'} action="See all" onAction={() => navigation.navigate('Jobs')} />
      <Card style={{ padding: 0 }}>
        {trackJobs.length === 0 ? (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, padding: spacing.lg }}>
            No openings match your track yet — check back soon.
          </Text>
        ) : (
          trackJobs.map((j, i) => (
            <View
              key={j.id}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>{j.title}</Text>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 3 }}>
                {j.company} · {j.location}
                {j.vacancies ? ` · ${j.vacancies} opening${j.vacancies > 1 ? 's' : ''}` : ''}
              </Text>
            </View>
          ))
        )}
      </Card>

      <SectionHeader title="Recent activity" />
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
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors[ACTIVITY_DOT[item.tone] ?? 'navy'] }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{item.text}</Text>
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 2 }}>{fmtDate(item.time)}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      <SectionHeader title="Quick actions" />
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Button title="Resume Center" variant="secondary" onPress={() => navigation.navigate('Resume')} style={{ flexBasis: '47%', flexGrow: 1 }} />
          <Button title="Mock Interview" variant="secondary" onPress={() => navigation.navigate('MockInterview')} style={{ flexBasis: '47%', flexGrow: 1 }} />
          <Button title="Job Openings" variant="secondary" onPress={() => navigation.navigate('Jobs')} style={{ flexBasis: '47%', flexGrow: 1 }} />
          <Button title="Placement Desk" variant="secondary" onPress={() => navigation.navigate('Messages')} style={{ flexBasis: '47%', flexGrow: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Feather name="zap" size={14} color={colors.goldStrong} />
          <Text style={{ flex: 1, color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, lineHeight: 18 }}>
            Mzobs provides placement support, not a job guarantee. Your ₹{fee} covers verification, coaching and getting your resume in front of hiring
            companies — selection is always the employer's call.
          </Text>
        </View>
      </Card>
    </ScreenContainer>
  )
}
