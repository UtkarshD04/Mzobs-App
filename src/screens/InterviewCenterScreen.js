import { View, Text, Linking } from 'react-native'
import { useTheme } from '../theme'
import { useInterviewsQuery } from '../hooks/useInterviews'
import { interviewStatusTone } from '../lib/statusTone'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import InterviewCenterSkeleton from '../components/ui/skeletons/InterviewCenterSkeleton'

const TODAY = new Date()
const LEAD_BLANKS = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1).getDay()
const DAYS_IN_MONTH = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate()
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function MiniCalendar({ eventDays }) {
  const { colors, fontFamily } = useTheme()
  const cells = [...Array(LEAD_BLANKS).fill(null), ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1)]

  return (
    <Card>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: 12 }}>
        {TODAY.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: colors.inkTertiary, fontFamily: fontFamily.bold, fontSize: 10.5 }}>
            {d}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {cells.map((d, i) => {
          const isToday = d === TODAY.getDate()
          const hasEvent = d && eventDays.has(d)
          return (
            <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
              {d ? (
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isToday ? 1.5 : 0,
                    borderColor: colors.navy,
                  }}
                >
                  <Text style={{ color: isToday ? colors.navy : colors.inkSecondary, fontFamily: isToday ? fontFamily.bold : fontFamily.regular, fontSize: 12.5 }}>
                    {d}
                  </Text>
                  {hasEvent ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.goldDot, marginTop: 1 }} /> : null}
                </View>
              ) : null}
            </View>
          )
        })}
      </View>
    </Card>
  )
}

export default function InterviewCenterScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: interviews = [], isLoading, refetch, isRefetching } = useInterviewsQuery()

  if (isLoading) return <InterviewCenterSkeleton />

  const eventDays = new Set(
    interviews
      .filter((i) => i.when && new Date(i.when).getMonth() === TODAY.getMonth() && new Date(i.when).getFullYear() === TODAY.getFullYear())
      .map((i) => new Date(i.when).getDate())
  )
  const upcoming = interviews
    .filter((i) => ['Confirmed', 'Awaiting confirmation'].includes(i.status))
    .sort((a, b) => new Date(a.when) - new Date(b.when))[0]

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Interview Center</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4 }}>
        Interviews appear here once Mzobs shares your profile with an employer.
      </Text>

      <View style={{ marginTop: spacing.lg }}>
        <MiniCalendar eventDays={eventDays} />
      </View>

      <View style={{ marginTop: spacing.md }}>
        {upcoming ? (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>
                {upcoming.company} — {upcoming.round || 'Interview'}
              </Text>
              <Badge label={upcoming.status} tone={interviewStatusTone[upcoming.status] ?? 'navy'} />
            </View>

            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4 }}>
              {upcoming.role} · Profile shared {fmtDate(upcoming.sharedOn)}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.md }}>
              {[
                ['Date & Time', upcoming.when ? new Date(upcoming.when).toLocaleString('en-IN') : '—'],
                ['Mode', upcoming.mode ?? (upcoming.location ? 'On-site' : '—')],
                ['Round', upcoming.round || '—'],
                ['Duration', upcoming.duration ? `${upcoming.duration} min` : '—'],
              ].map(([label, val]) => (
                <View key={label} style={{ minWidth: '40%' }}>
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11 }}>{label}</Text>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 12.5, marginTop: 2 }}>{val}</Text>
                </View>
              ))}
            </View>

            {upcoming.location && !upcoming.link ? (
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.md }}>{upcoming.location}</Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
              <Button
                title="Reschedule"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() =>
                  navigation.navigate('Messages', {
                    prefillDraft: `I'd like to request a new time for my ${upcoming.round || 'interview'} with ${upcoming.company} (currently ${
                      upcoming.when ? new Date(upcoming.when).toLocaleString('en-IN') : 'unscheduled'
                    }). Reason: `,
                  })
                }
              />
              {upcoming.link ? <Button title="Join meeting" style={{ flex: 1 }} onPress={() => Linking.openURL(upcoming.link)} /> : null}
            </View>
          </Card>
        ) : (
          <Card>
            <EmptyState icon="calendar" title="No interview scheduled yet" message="Once an employer wants to meet you, Mzobs schedules it and it shows up here." />
          </Card>
        )}
      </View>

      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.sm }}>
        Interview history
      </Text>
      {interviews.length === 0 ? (
        <Card>
          <EmptyState icon="calendar" title="No interviews yet" message="Interviews scheduled by employers through Mzobs will appear here." />
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {interviews.map((i, idx) => (
            <View
              key={i.id}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{i.company}</Text>
                <Badge label={i.status} tone={interviewStatusTone[i.status] ?? 'navy'} />
              </View>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 3 }}>
                {i.round || '—'} · {fmtDate(i.when)} · {i.mode ?? (i.location ? 'On-site' : '—')}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </ScreenContainer>
  )
}
