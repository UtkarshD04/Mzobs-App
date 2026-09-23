import { useEffect, useState } from 'react'
import { View, Text, Pressable, Switch } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/useProfile'
import { useSubscriptionQuery } from '../hooks/useSubscription'
import { profileCompletionDetail } from '../lib/dashboard'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import TextField from '../components/ui/TextField'
import CityField from '../components/ui/CityField'
import Button from '../components/ui/Button'
import { stateForCity } from '../lib/indianCities'
import Avatar from '../components/ui/Avatar'
import Tag from '../components/ui/Tag'
import FilterChip from '../components/ui/FilterChip'
import ErrorState from '../components/ui/ErrorState'
import { notifySuccess, notifyError } from '../lib/haptics'
import ProfileSkeleton from '../components/ui/skeletons/ProfileSkeleton'

// Public fields are what recruiters see when Mzobs shares this profile.
// Phone is kept private/contact-only, visually separated per the redesign spec.
const PUBLIC_FIELD_GROUPS = [
  {
    title: 'Basic info',
    fields: [
      { key: 'name', label: 'Full name' },
      { key: 'currentCity', label: 'Current city' },
      { key: 'state', label: 'State' },
      { key: 'pincode', label: 'Pincode' },
    ],
  },
  {
    title: 'Experience',
    fields: [
      { key: 'currentCompany', label: 'Current company' },
      { key: 'designation', label: 'Designation' },
      { key: 'preferredRole', label: 'Preferred role' },
      { key: 'resumeHeadline', label: 'Resume headline' },
    ],
  },
  {
    title: 'Preferences & links',
    fields: [
      { key: 'portfolioLink', label: 'Portfolio link' },
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'github', label: 'GitHub' },
    ],
  },
]
const PRIVATE_FIELD_GROUP = {
  title: 'Contact details',
  caption: 'Private — only Mzobs sees this, never shown to recruiters',
  fields: [
    { key: 'phone', label: 'Phone' },
    { key: 'dob', label: 'Date of birth (YYYY-MM-DD)' },
    { key: 'gender', label: 'Gender' },
  ],
}
const FIELD_GROUPS = [...PUBLIC_FIELD_GROUPS, PRIVATE_FIELD_GROUP]
const EDITABLE_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields)

const WORK_MODES = ['On-site', 'Hybrid', 'Remote']
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']

function SectionLabel({ children, style }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <Text
      style={[
        {
          color: colors.inkTertiary,
          fontFamily: fontFamily.semibold,
          fontSize: 11.5,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}

function ChipListEditor({ label, values, onChange, placeholder }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [draft, setDraft] = useState('')

  function addValue() {
    const v = draft.trim()
    if (!v || values.includes(v)) return
    onChange([...values, v])
    setDraft('')
  }

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{label}</Text>
      ) : null}
      {values.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm }}>
          {values.map((v) => (
            <Pressable key={v} onPress={() => onChange(values.filter((x) => x !== v))} hitSlop={4} accessibilityLabel={`Remove ${v}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Tag label={v} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <TextField
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            onSubmitEditing={addValue}
            returnKeyType="done"
            style={{ marginBottom: 0 }}
          />
        </View>
        <Pressable
          onPress={addValue}
          style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="plus" size={18} color={colors.navy} />
        </Pressable>
      </View>
      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11, marginTop: 4 }}>Tap a tag to remove it.</Text>
    </View>
  )
}

function MultiSelectChips({ label, options, values, onChange }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {options.map((opt) => {
          const active = values.includes(opt)
          return (
            <FilterChip
              key={opt}
              label={opt}
              active={active}
              onPress={() => onChange(active ? values.filter((v) => v !== opt) : [...values, opt])}
            />
          )
        })}
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: profile, isLoading, isError, refetch, isRefetching } = useProfileQuery()
  const { data: subscription } = useSubscriptionQuery()
  const updateMutation = useUpdateProfileMutation()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile && !form) {
      const initial = {}
      EDITABLE_FIELDS.forEach(({ key }) => (initial[key] = profile[key] ?? ''))
      initial.skills = profile.skills ?? []
      initial.preferredLocations = profile.preferredLocations ?? []
      initial.workModePreference = profile.workModePreference ?? []
      initial.jobTypePreference = profile.jobTypePreference ?? []
      initial.expectedSalaryMin = profile.expectedSalaryMin != null ? String(profile.expectedSalaryMin) : ''
      initial.expectedSalaryMax = profile.expectedSalaryMax != null ? String(profile.expectedSalaryMax) : ''
      initial.openToOpportunities = profile.openToOpportunities ?? true
      initial.jobAlertsEnabled = profile.jobAlertsEnabled ?? true
      setForm(initial)
    }
  }, [profile])

  if (isError && !profile)
    return (
      <ScreenContainer>
        <ErrorState title="Couldn't load your profile" onRetry={refetch} retrying={isRefetching} />
      </ScreenContainer>
    )
  if (isLoading || !form) return <ProfileSkeleton />

  const { percent: completion, missing: completionMissing } = profileCompletionDetail(profile)
  const isPaid = subscription?.status === 'paid'

  const set = (key) => (value) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setError('')
    try {
      await updateMutation.mutateAsync({
        ...form,
        expectedSalaryMin: form.expectedSalaryMin ? Number(form.expectedSalaryMin) : null,
        expectedSalaryMax: form.expectedSalaryMax ? Number(form.expectedSalaryMax) : null,
      })
      setSaved(true)
      notifySuccess()
    } catch (err) {
      notifyError()
      setError(err.response?.data?.message ?? 'Could not save your changes. Please try again.')
    }
  }

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Avatar name={form.name || profile.name} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>{form.name || 'Profile'}</Text>
            <Badge label={isPaid ? 'Active' : 'Inactive'} tone={isPaid ? 'navy' : 'gold'} />
          </View>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 2 }}>
            Keep this up to date — recruiters see it when Mzobs shares your profile.
          </Text>
        </View>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Profile completeness
          </Text>
          <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 14 }}>{completion}%</Text>
        </View>
        <ProgressBar value={completion} style={{ marginTop: spacing.sm }} />
        {completion < 100 ? (
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: spacing.sm }}>
            Still to add: {completionMissing.map((m) => m.label.toLowerCase()).join(', ')}.
          </Text>
        ) : null}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        {PUBLIC_FIELD_GROUPS.map((group, i) => (
          <View key={group.title}>
            <SectionLabel style={i === 0 ? { marginTop: 0 } : undefined}>{group.title}</SectionLabel>
            {group.fields.map(({ key, label }) => {
              if (key === 'currentCity') {
                return (
                  <CityField
                    key={key}
                    label={label}
                    value={form[key]}
                    onSelectCity={(city) => {
                      set('currentCity')(city)
                      const state = stateForCity(city)
                      if (state) set('state')(state === 'Remote' ? '' : state)
                    }}
                  />
                )
              }
              if (key === 'pincode') {
                return (
                  <TextField
                    key={key}
                    label={label}
                    value={form[key]}
                    onChangeText={(v) => set('pincode')(v.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                )
              }
              return <TextField key={key} label={label} value={form[key]} onChangeText={set(key)} />
            })}
          </View>
        ))}

        <SectionLabel>Skills</SectionLabel>
        <ChipListEditor values={form.skills} onChange={set('skills')} placeholder="Add a skill" />

        <View style={{ marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="lock" size={11} color={colors.inkTertiary} />
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase' }}>
              {PRIVATE_FIELD_GROUP.title}
            </Text>
          </View>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 2, marginBottom: spacing.sm }}>
            {PRIVATE_FIELD_GROUP.caption}
          </Text>
          {PRIVATE_FIELD_GROUP.fields.map(({ key, label }) => (
            <TextField key={key} label={label} value={form[key]} onChangeText={set(key)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.sm }}>Career preferences</Text>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Expected salary — min (₹/yr)"
              value={form.expectedSalaryMin}
              onChangeText={set('expectedSalaryMin')}
              keyboardType="number-pad"
              placeholder="e.g. 400000"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Expected salary — max (₹/yr)"
              value={form.expectedSalaryMax}
              onChangeText={set('expectedSalaryMax')}
              keyboardType="number-pad"
              placeholder="e.g. 600000"
            />
          </View>
        </View>

        <ChipListEditor label="Preferred locations" values={form.preferredLocations} onChange={set('preferredLocations')} placeholder="Add a city" />

        <MultiSelectChips label="Work mode" options={WORK_MODES} values={form.workModePreference} onChange={set('workModePreference')} />
        <MultiSelectChips label="Job type" options={JOB_TYPES} values={form.jobTypePreference} onChange={set('jobTypePreference')} />
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.sm }}>Visibility</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>Open to opportunities</Text>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 1 }}>
              Off hides you from new recruiter matches.
            </Text>
          </View>
          <Switch
            value={form.openToOpportunities}
            onValueChange={set('openToOpportunities')}
            trackColor={{ false: colors.surfaceSunken, true: colors.navyTintStrong }}
            thumbColor={form.openToOpportunities ? colors.navy : '#ffffff'}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs, marginTop: spacing.sm }}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>Job alerts</Text>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 1 }}>
              Get notified about roles that match your preferences.
            </Text>
          </View>
          <Switch
            value={form.jobAlertsEnabled}
            onValueChange={set('jobAlertsEnabled')}
            trackColor={{ false: colors.surfaceSunken, true: colors.navyTintStrong }}
            thumbColor={form.jobAlertsEnabled ? colors.navy : '#ffffff'}
          />
        </View>
      </Card>

      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.md }}>{error}</Text> : null}
      {saved && !error ? (
        <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: spacing.md }}>Saved.</Text>
      ) : null}

      <Button title="Save changes" onPress={handleSave} loading={updateMutation.isPending} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  )
}
