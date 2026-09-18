import { useState } from 'react'
import { View, Text, Alert } from 'react-native'
import { useTheme } from '../theme'
import { useApplicationsQuery, useWithdrawApplicationMutation } from '../hooks/useApplications'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import FilterChip from '../components/ui/FilterChip'
import StatusTimeline from '../components/ui/StatusTimeline'
import ApplicationsSkeleton from '../components/ui/skeletons/ApplicationsSkeleton'

const STAGE_INDEX = { new: 1, screening: 2, shortlisted: 3, shared: 4, interview: 5, selected: 6, rejected: 6 }
const FILTERS = ['All', 'Active', 'Selected', 'Rejected']
const WITHDRAWABLE_STATUSES = ['new', 'screening', 'shortlisted']

export default function ApplicationsScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: applications = [], isLoading, refetch, isRefetching } = useApplicationsQuery()
  const withdrawMutation = useWithdrawApplicationMutation()
  const [filter, setFilter] = useState('All')

  if (isLoading) return <ApplicationsSkeleton />

  function handleWithdraw(application) {
    Alert.alert('Withdraw application?', `You'll no longer be considered for ${application.job?.title ?? 'this role'}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () => withdrawMutation.mutate(application.id) },
    ])
  }

  const filtered = applications.filter((a) => {
    if (filter === 'All') return true
    if (filter === 'Selected') return a.status === 'selected'
    if (filter === 'Rejected') return a.status === 'rejected'
    return a.status !== 'selected' && a.status !== 'rejected'
  })

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>My Applications</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4 }}>
        Follow every application from the moment it reaches Mzobs to the employer's decision.
      </Text>

      {applications.length > 0 ? (
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5, marginTop: spacing.sm }}>
          You've applied to {applications.length} {applications.length === 1 ? 'job' : 'jobs'}
        </Text>
      ) : null}

      {applications.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg }}>
          {FILTERS.map((f) => (
            <FilterChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </View>
      ) : null}

      {applications.length === 0 ? (
        <Card style={{ marginTop: spacing.lg }}>
          <EmptyState icon="clipboard" title="No applications yet" message="Browse job openings and apply — they'll show up here with live status." />
        </Card>
      ) : filtered.length === 0 ? (
        <Card style={{ marginTop: spacing.lg }}>
          <EmptyState icon="filter" title="No applications match this filter" message="Try a different filter to see more." />
        </Card>
      ) : (
        filtered.map((a) => {
          const stage = STAGE_INDEX[a.status] ?? 1
          return (
            <Card key={a.id} style={{ marginTop: spacing.md, padding: spacing.md, borderRadius: 10, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ color: '#111827', fontFamily: fontFamily.semibold, fontSize: 16 }} numberOfLines={2}>
                    {a.job?.title ?? 'Role'}
                  </Text>
                  <Text style={{ color: '#6B7280', fontFamily: fontFamily.regular, fontSize: 13, marginTop: 3 }}>
                    Applied {fmtDate(a.appliedOn)}
                  </Text>
                </View>
                {a.status === 'selected' ? (
                  <Badge label="Selected" tone="green" />
                ) : a.status === 'rejected' ? (
                  <Badge label="Not selected" tone="red" />
                ) : stage >= 4 ? (
                  <Badge label="With employer" tone="gray" />
                ) : (
                  <Badge label="With Mzobs" tone="navy" />
                )}
              </View>

              <StatusTimeline stage={stage} rejected={a.status === 'rejected'} />

              {a.note ? (
                <Text
                  style={{
                    color: '#6B7280',
                    fontFamily: fontFamily.regular,
                    fontSize: 13,
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  {a.note}
                </Text>
              ) : null}

              {WITHDRAWABLE_STATUSES.includes(a.status) ? (
                <Button
                  title="Withdraw application"
                  variant="danger"
                  onPress={() => handleWithdraw(a)}
                  loading={withdrawMutation.isPending && withdrawMutation.variables === a.id}
                  style={{ marginTop: spacing.md }}
                />
              ) : null}
            </Card>
          )
        })
      )}
    </ScreenContainer>
  )
}
