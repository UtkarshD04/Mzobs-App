import { View, Text } from 'react-native'
import { useTheme } from '../theme'
import { useApplicationsQuery } from '../hooks/useApplications'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const STAGE_INDEX = { new: 1, screening: 2, shortlisted: 3, shared: 4, interview: 5, selected: 6, rejected: 6 }
const STAGE_LABELS = ['Applied to Mzobs', 'Mzobs screening', 'Shortlisted', 'Profile shared', 'Interview scheduled', 'Result']

function Stepper({ stage, rejected }) {
  const { colors, fontFamily } = useTheme()
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {STAGE_LABELS.map((label, i) => {
        const isRejectedHere = rejected && i === stage - 1
        const done = i < stage - 1
        const current = i === stage - 1
        const color = isRejectedHere ? colors.red : done || current ? colors.navy : colors.inkTertiary
        const bg = isRejectedHere ? colors.redTint : done || current ? colors.navyTint : colors.surfaceSunken
        return (
          <View key={label} style={{ backgroundColor: bg, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 }}>
            <Text style={{ color, fontFamily: fontFamily.semibold, fontSize: 10.5 }}>{label}</Text>
          </View>
        )
      })}
    </View>
  )
}

export default function ApplicationsScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: applications = [], isLoading, refetch, isRefetching } = useApplicationsQuery()

  if (isLoading) return <LoadingSpinner />

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>My Applications</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4 }}>
        Follow every application from the moment it reaches Mzobs to the employer's decision.
      </Text>

      {applications.length === 0 ? (
        <Card style={{ marginTop: spacing.lg }}>
          <EmptyState icon="clipboard" title="No applications yet" message="Browse job openings and apply — they'll show up here with live status." />
        </Card>
      ) : (
        applications.map((a) => {
          const stage = STAGE_INDEX[a.status] ?? 1
          return (
            <Card key={a.id} style={{ marginTop: spacing.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 }}>{a.job?.title ?? 'Role'}</Text>
                  <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 3 }}>
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

              <Stepper stage={stage} rejected={a.status === 'rejected'} />

              {a.note ? (
                <Text
                  style={{
                    color: colors.inkSecondary,
                    fontFamily: fontFamily.regular,
                    fontSize: 12.5,
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  {a.note}
                </Text>
              ) : null}
            </Card>
          )
        })
      )}
    </ScreenContainer>
  )
}
