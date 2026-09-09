import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/useProfile'
import { useSubscriptionQuery } from '../hooks/useSubscription'
import { profileCompletion } from '../lib/dashboard'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Tag from '../components/ui/Tag'
import ProfileSkeleton from '../components/ui/skeletons/ProfileSkeleton'

// Public fields are what recruiters see when Mzobs shares this profile.
// Phone is kept private/contact-only, visually separated per the redesign spec.
const PUBLIC_FIELD_GROUPS = [
  {
    title: 'Basic info',
    fields: [
      { key: 'name', label: 'Full name' },
      { key: 'currentCity', label: 'Current city' },
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
  fields: [{ key: 'phone', label: 'Phone' }],
}
const FIELD_GROUPS = [...PUBLIC_FIELD_GROUPS, PRIVATE_FIELD_GROUP]
const EDITABLE_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields)

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

export default function ProfileScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: profile, isLoading } = useProfileQuery()
  const { data: subscription } = useSubscriptionQuery()
  const updateMutation = useUpdateProfileMutation()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile && !form) {
      const initial = {}
      EDITABLE_FIELDS.forEach(({ key }) => (initial[key] = profile[key] ?? ''))
      setForm(initial)
    }
  }, [profile])

  if (isLoading || !form) return <ProfileSkeleton />

  const completion = profileCompletion(profile)
  const isPaid = subscription?.status === 'paid'

  const set = (key) => (value) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setError('')
    try {
      await updateMutation.mutateAsync(form)
      setSaved(true)
    } catch (err) {
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
            Complete your profile so recruiters see a stronger match.
          </Text>
        ) : null}
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        {PUBLIC_FIELD_GROUPS.map((group, i) => (
          <View key={group.title}>
            <SectionLabel style={i === 0 ? { marginTop: 0 } : undefined}>{group.title}</SectionLabel>
            {group.fields.map(({ key, label }) => (
              <TextField key={key} label={label} value={form[key]} onChangeText={set(key)} />
            ))}
          </View>
        ))}

        {(profile.skills ?? []).length > 0 ? (
          <View>
            <SectionLabel>Skills</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.md }}>
              {profile.skills.map((skill) => (
                <Tag key={skill} label={skill} />
              ))}
            </View>
          </View>
        ) : null}

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

        {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>{error}</Text> : null}
        {saved && !error ? (
          <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>Saved.</Text>
        ) : null}

        <Button title="Save changes" onPress={handleSave} loading={updateMutation.isPending} />
      </Card>
    </ScreenContainer>
  )
}
