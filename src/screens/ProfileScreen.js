import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../theme'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/useProfile'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Tag from '../components/ui/Tag'
import ProfileSkeleton from '../components/ui/skeletons/ProfileSkeleton'

const FIELD_GROUPS = [
  {
    title: 'Personal details',
    fields: [
      { key: 'name', label: 'Full name' },
      { key: 'phone', label: 'Phone' },
      { key: 'currentCity', label: 'Current city' },
    ],
  },
  {
    title: 'Work & experience',
    fields: [
      { key: 'currentCompany', label: 'Current company' },
      { key: 'designation', label: 'Designation' },
      { key: 'preferredRole', label: 'Preferred role' },
      { key: 'resumeHeadline', label: 'Resume headline' },
    ],
  },
  {
    title: 'Links',
    fields: [
      { key: 'portfolioLink', label: 'Portfolio link' },
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'github', label: 'GitHub' },
    ],
  },
]
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
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>{form.name || 'Profile'}</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 2 }}>
            Keep this up to date — recruiters see it when Mzobs shares your profile.
          </Text>
        </View>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        {FIELD_GROUPS.map((group, i) => (
          <View key={group.title}>
            <SectionLabel style={i === 0 ? { marginTop: 0 } : undefined}>{group.title}</SectionLabel>
            {group.fields.map(({ key, label }) => (
              <TextField key={key} label={label} value={form[key]} onChangeText={set(key)} />
            ))}
          </View>
        ))}

        {(profile.skills ?? []).length > 0 ? (
          <View style={{ marginBottom: spacing.md }}>
            <SectionLabel>Skills</SectionLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {profile.skills.map((skill) => (
                <Tag key={skill} label={skill} />
              ))}
            </View>
          </View>
        ) : null}

        {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>{error}</Text> : null}
        {saved && !error ? (
          <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>Saved.</Text>
        ) : null}

        <Button title="Save changes" onPress={handleSave} loading={updateMutation.isPending} />
      </Card>
    </ScreenContainer>
  )
}
