import { View, Text, Linking } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useProfileQuery } from '../hooks/useProfile'
import { useMockInterviewQuery } from '../hooks/useMockInterview'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import PaymentLock from '../components/ui/PaymentLock'
import MockInterviewSkeleton from '../components/ui/skeletons/MockInterviewSkeleton'

export default function MockInterviewScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: profile, isLoading: profileLoading } = useProfileQuery()
  const { data: mock, isLoading: mockLoading, refetch, isRefetching } = useMockInterviewQuery()

  if (profileLoading || mockLoading) return <MockInterviewSkeleton />

  if (profile?.subscription?.status !== 'paid') {
    return (
      <ScreenContainer>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Mock Interview</Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4 }}>
          The verification round the Mzobs panel runs after your resume clears. Your score decides your skill track.
        </Text>
        <PaymentLock
          title="Activate placement support to unlock this round"
          body="A one-time ₹299 payment unlocks resume upload and verification — once your resume clears, this is where your mock interview shows up."
          navigation={navigation}
        />
      </ScreenContainer>
    )
  }

  const done = mock?.status === 'completed'
  const scheduled = mock?.status === 'scheduled'
  const skillTrack = profile?.skillTrack

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Mock Interview</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4 }}>
        The verification round the Mzobs panel runs after your resume clears. Your score decides your skill track.
      </Text>

      <Card style={{ marginTop: spacing.lg, backgroundColor: colors.navyTint, borderColor: colors.navyTintStrong }}>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
          <Feather name="shield" size={20} color={colors.navy} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>How this round works</Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4, lineHeight: 18 }}>
              Once your resume is verified, our hiring team schedules you with a panel member — a real interview scoring communication, domain
              knowledge and attitude. After it, you're placed in a skill track.
            </Text>
          </View>
        </View>
      </Card>

      {done && skillTrack?.key ? (
        <Card style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>
              Your skill track: {skillTrack.label || skillTrack.key}
            </Text>
            <Badge label={`Grade ${skillTrack.grade || '-'}`} tone="gold" />
          </View>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.sm }}>
            Assigned {fmtDate(skillTrack.assignedOn)}
            {skillTrack.assignedBy ? ` by ${skillTrack.assignedBy}` : ''}, based on a panel score of {mock?.scores?.overall ?? '—'}/100.{' '}
            {skillTrack.note}
          </Text>
        </Card>
      ) : scheduled ? (
        <Card style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>Verification round with {mock.panel}</Text>
            <Badge label="Scheduled by Mzobs" tone="gold" />
          </View>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 6 }}>
            {mock.when ? new Date(mock.when).toLocaleString('en-IN') : ''} · {mock.mode}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Button
              title="Request reschedule"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate('Messages', {
                  prefillDraft: `I'd like to request a new time for my mock interview with ${mock.panel} (currently ${
                    mock.when ? new Date(mock.when).toLocaleString('en-IN') : 'unscheduled'
                  }). Reason: `,
                })
              }
            />
            {mock.link ? (
              <Button title="Join" style={{ flex: 1 }} onPress={() => Linking.openURL(mock.link)} />
            ) : null}
          </View>
        </Card>
      ) : (
        <Card style={{ marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.xl }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>Not scheduled yet</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4, textAlign: 'center' }}>
            Once your resume is verified, the Mzobs team will schedule your verification interview.
          </Text>
        </Card>
      )}

      {done ? (
        <>
          <Card style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Panel score
            </Text>
            <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 36, marginTop: spacing.sm }}>
              {mock.scores?.overall ?? 0}
              <Text style={{ fontSize: 18, color: colors.inkTertiary }}>/100</Text>
            </Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 6 }}>
              {fmtDate(mock.completedOn)} · {mock.panel} {mock.panelRole ? `(${mock.panelRole})` : ''}
            </Text>
          </Card>

          <Card style={{ marginTop: spacing.md }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>Score breakdown</Text>
            {[
              ['Communication', mock.scores?.comm],
              ['Domain knowledge', mock.scores?.domain],
              ['Attitude & ownership', mock.scores?.attitude],
              ['Overall', mock.scores?.overall],
            ].map(([label, v]) => (
              <View key={label} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.regular, fontSize: 12.5 }}>{label}</Text>
                  <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5 }}>{v ?? '—'}/100</Text>
                </View>
                <ProgressBar value={v ?? 0} />
              </View>
            ))}
          </Card>

          {mock.feedback?.length > 0 ? (
            <Card style={{ marginTop: spacing.md }}>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>Panel feedback</Text>
              {mock.feedback.map((f, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: i === mock.feedback.length - 1 ? 0 : spacing.sm }}>
                  <Feather name={f.tone === 'good' ? 'check' : 'zap'} size={14} color={f.tone === 'good' ? colors.green : colors.goldStrong} style={{ marginTop: 2 }} />
                  <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 13 }}>{f.text}</Text>
                </View>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}
    </ScreenContainer>
  )
}
