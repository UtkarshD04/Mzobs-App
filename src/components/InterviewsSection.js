import { View, Text, Pressable, Linking } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import Card from './ui/Card'
import { useInterviewsQuery, useMockInterviewQuery } from '../hooks/useInterviews'

const MOCK_STATUS = { scheduled: 'Scheduled', completed: 'Completed', no_show: 'Missed' }
const SCORE_LABELS = { comm: 'Communication', domain: 'Domain knowledge', attitude: 'Attitude', overall: 'Overall' }

const fmtWhen = (value) => new Date(value).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

function JoinLink({ url }) {
  const { colors, fontFamily } = useTheme()
  return (
    <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
      <Feather name="video" size={13} color={colors.navy} />
      <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 13 }}>Join</Text>
    </Pressable>
  )
}

// Employer-scheduled interviews (upcoming first) plus the latest Mzobs mock
// interview, straight from the API — says so plainly when nothing is scheduled.
export default function InterviewsSection({ enabled = true }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: interviews, isLoading: l1, isError: e1 } = useInterviewsQuery({ enabled })
  const { data: mock, isLoading: l2, isError: e2 } = useMockInterviewQuery({ enabled })

  const now = Date.now()
  const list = interviews ?? []
  const upcoming = list.filter((iv) => new Date(iv.when).getTime() >= now && !['Cancelled', 'Completed'].includes(iv.status))
  const past = list.filter((iv) => !upcoming.includes(iv)).reverse().slice(0, 3)
  const mockShown = mock && mock.status && mock.status !== 'not_scheduled'
  const scores = mockShown ? Object.entries(SCORE_LABELS).filter(([k]) => mock.scores?.[k] != null) : []

  const body = { color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20 }

  return (
    <Card style={{ marginTop: spacing.lg }}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 17 }}>Interviews</Text>
      {l1 || l2 ? (
        <Text style={[body, { marginTop: 6 }]}>Loading…</Text>
      ) : e1 && e2 ? (
        <Text style={[body, { marginTop: 6 }]}>Interviews couldn't be loaded right now. Pull down to retry.</Text>
      ) : (
        <>
          {upcoming.length === 0 && past.length === 0 && !mockShown ? (
            <Text style={[body, { marginTop: 6 }]}>Nothing scheduled yet. When an employer or the Mzobs team schedules an interview with you, the time, mode and joining details show up here.</Text>
          ) : null}
          {[...upcoming, ...past].map((iv) => {
            const isUpcoming = upcoming.includes(iv)
            return (
              <View key={iv.id} style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5 }}>
                  {iv.role}
                  {iv.round ? <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular }}> · {iv.round}</Text> : null}
                </Text>
                {iv.company ? <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 1 }}>{iv.company}</Text> : null}
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4 }}>
                  {fmtWhen(iv.when)}
                  {iv.duration ? ` · ${iv.duration} min` : ''} · {iv.mode === 'On-site' && iv.location ? iv.location : iv.mode} · {iv.status}
                </Text>
                {isUpcoming && iv.mode === 'Video Call' && iv.link ? <JoinLink url={iv.link} /> : null}
              </View>
            )
          })}
          {mockShown ? (
            <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5 }}>Mzobs mock interview</Text>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{MOCK_STATUS[mock.status] ?? mock.status}</Text>
              </View>
              {mock.status === 'scheduled' && mock.when ? (
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 4 }}>
                  {fmtWhen(mock.when)}
                  {mock.mode ? ` · ${mock.mode}` : ''}
                  {mock.panel ? ` · with ${mock.panel}${mock.panelRole ? ` (${mock.panelRole})` : ''}` : ''}
                </Text>
              ) : null}
              {mock.status === 'scheduled' && mock.link ? <JoinLink url={mock.link} /> : null}
              {scores.length > 0 ? (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {scores.map(([k, label]) => (
                    <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13 }}>{label}</Text>
                      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>{mock.scores[k]}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </Card>
  )
}
