import { useState } from 'react'
import { View, Text, Alert, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../theme'
import { useApplicationsQuery, useWithdrawApplicationMutation } from '../hooks/useApplications'
import { useProfileQuery } from '../hooks/useProfile'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ErrorState from '../components/ui/ErrorState'
import { notifyError } from '../lib/haptics'
import EmptyState from '../components/ui/EmptyState'
import InterviewsSection from '../components/InterviewsSection'
import FilterChip from '../components/ui/FilterChip'
import ApplicationsSkeleton from '../components/ui/skeletons/ApplicationsSkeleton'

const STAGE_LABEL = {
  new: 'Applied',
  screening: 'Under review',
  shortlisted: 'Shortlisted',
  shared: 'Shared with employer',
  viewed: 'Viewed by employer',
  interview: 'Interview',
  selected: 'Selected',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
}

// Every stage the application went through, with dates. The server only sends
// the dates to Premium accounts, and Basic never reaches this list (see the
// gate in ApplicationsScreen).
function ApplicationTimeline({ application }) {
  const { colors, spacing, fontFamily } = useTheme()
  const [open, setOpen] = useState(false)

  const events = [
    ...(application.statusHistory ?? []),
    ...(application.employerViewedOn ? [{ status: 'viewed', changedOn: application.employerViewedOn }] : []),
  ]
    .filter((e) => e.changedOn)
    .sort((a, b) => new Date(a.changedOn) - new Date(b.changedOn))

  return (
    <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
      >
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>Timeline</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={15} color={colors.inkTertiary} />
      </Pressable>
      {open ? (
        <View style={{ marginTop: spacing.sm }}>
          {events.length === 0 ? (
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>Applied {fmtDate(application.appliedOn)}. No updates yet.</Text>
          ) : (
            events.map((e, i) => {
              const last = i === events.length - 1
              const closed = e.status === 'rejected' || e.status === 'withdrawn'
              return (
                <View key={`${e.status}-${e.changedOn}-${i}`} style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ alignItems: 'center', width: 12 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, marginTop: 4, backgroundColor: closed ? colors.red : colors.navy }} />
                    {!last ? <View style={{ flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 }} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: last ? 0 : spacing.md }}>
                    <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{STAGE_LABEL[e.status] ?? e.status}</Text>
                    <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>{fmtDate(e.changedOn)}</Text>
                  </View>
                </View>
              )
            })
          )}
        </View>
      ) : null}
    </View>
  )
}

const REJECTED_AFTER = { interview: 'after the interview', shortlisted: 'after shortlisting', shared: 'at the screening stage' }

// Shown on a rejected application: how far it got and the employer's own reason.
function RejectionNote({ application }) {
  const { colors, spacing, fontFamily } = useTheme()
  const after = REJECTED_AFTER[application.rejectedAfter]
  return (
    <View style={{ marginTop: spacing.md, padding: spacing.md, borderRadius: 10, backgroundColor: colors.redTint }}>
      <Text style={{ color: colors.red, fontFamily: fontFamily.semibold, fontSize: 13 }}>Not selected{after ? ` ${after}` : ''}</Text>
      {application.rejectionReason ? (
        <Text style={{ color: colors.ink, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20, marginTop: 4 }}>
          <Text style={{ fontFamily: fontFamily.semibold }}>Reason from the employer: </Text>
          {application.rejectionReason}
        </Text>
      ) : (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20, marginTop: 4 }}>The employer didn't share a reason for this decision.</Text>
      )}
    </View>
  )
}

const STAGE_INDEX = { new: 1, screening: 2, shortlisted: 3, shared: 4, interview: 5, selected: 6, rejected: 6 }
const FILTERS = ['All', 'Active', 'Selected', 'Rejected', 'Withdrawn']
// Same rule as the backend's WITHDRAWABLE_STATUSES. 'shared' has to be in it: an application
// reaches the employer the moment it's made, so that's the status most of them sit in.
const WITHDRAWABLE_STATUSES = ['new', 'screening', 'shortlisted', 'shared']

// Application tracking is a Premium perk — Basic accounts see this instead.
function TrackingLocked() {
  const { colors, spacing, fontFamily } = useTheme()
  const navigation = useNavigation()
  return (
    <ScreenContainer>
      <Card style={{ alignItems: 'center', padding: spacing.xl }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="lock" size={20} color={colors.navy} />
        </View>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18, textAlign: 'center', marginTop: spacing.md }}>Application tracking is a Premium feature</Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: 6 }}>
          Upgrade to follow every application stage by stage, see when employers view your profile, and withdraw an application when you need to.
        </Text>
        <Button title="See Premium" onPress={() => navigation.navigate('Subscription')} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
      </Card>
    </ScreenContainer>
  )
}

export default function ApplicationsScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: applications = [], isLoading, isError, refetch, isRefetching } = useApplicationsQuery()
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfileQuery()
  const withdrawMutation = useWithdrawApplicationMutation()
  const [filter, setFilter] = useState('All')

  if (isLoading || profileLoading) return <ApplicationsSkeleton />
  // Without the profile we can't tell Basic from Premium — don't wrongly lock a paid account.
  if (!profile)
    return (
      <ScreenContainer>
        <ErrorState title="Couldn't load your applications" onRetry={refetchProfile} />
      </ScreenContainer>
    )
  if (!profile.isPremium) return <TrackingLocked />
  if (isError && applications.length === 0)
    return (
      <ScreenContainer>
        <ErrorState title="Couldn't load applications" onRetry={refetch} retrying={isRefetching} />
      </ScreenContainer>
    )

  function handleWithdraw(application) {
    Alert.alert('Withdraw application?', `You'll no longer be considered for ${application.job?.title ?? 'this role'}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw', style: 'destructive', onPress: () =>
          withdrawMutation.mutate(application.id, {
            onError: () => {
              notifyError()
              Alert.alert('Could not withdraw', 'Something went wrong. Please try again.')
            },
          }),
      },
    ])
  }

  const filtered = applications.filter((a) => {
    if (filter === 'All') return true
    if (filter === 'Selected') return a.status === 'selected'
    if (filter === 'Rejected') return a.status === 'rejected'
    if (filter === 'Withdrawn') return a.status === 'withdrawn'
    return a.status !== 'selected' && a.status !== 'rejected' && a.status !== 'withdrawn'
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

      <InterviewsSection />

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
          const company = typeof a.job?.company === 'string' ? a.job.company : a.job?.company?.name
          const meta = [a.job?.location, a.job?.workMode].filter(Boolean).join(' · ')
          return (
            <Card key={a.id} style={{ marginTop: spacing.md, padding: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.sm }}>
                  <Avatar name={company || a.job?.title} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 16 }} numberOfLines={2}>
                      {a.job?.title ?? 'Role'}
                    </Text>
                    {company ? (
                      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13.5, marginTop: 2 }} numberOfLines={1}>
                        {company}
                      </Text>
                    ) : null}
                    {meta ? (
                      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 2 }} numberOfLines={1}>
                        {meta}
                      </Text>
                    ) : null}
                    <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 3 }}>
                      Applied {fmtDate(a.appliedOn)}
                    </Text>
                  </View>
                </View>
                {a.status === 'selected' ? (
                  <Badge label="Selected" tone="green" />
                ) : a.status === 'rejected' ? (
                  <Badge label="Not selected" tone="red" />
                ) : a.status === 'interview' ? (
                  <Badge label="Interview" tone="navy" />
                ) : a.status === 'shortlisted' ? (
                  <Badge label="Shortlisted" tone="green" />
                ) : a.status === 'withdrawn' ? (
                  <Badge label="Withdrawn" tone="gray" />
                ) : a.status === 'screening' ? (
                  <Badge label="Under review" tone="navy" />
                ) : stage >= 4 ? (
                  <Badge label={a.employerViewedOn ? 'Viewed by employer' : 'Shared with employer'} tone="gray" />
                ) : (
                  <Badge label="Applied" tone="navy" />
                )}
              </View>

              {a.note ? (
                <Text
                  style={{
                    color: colors.inkSecondary,
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

              {a.status === 'rejected' ? <RejectionNote application={a} /> : null}

              <ApplicationTimeline application={a} />

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
