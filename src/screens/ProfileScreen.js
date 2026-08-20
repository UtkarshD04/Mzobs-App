import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '../theme'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/useProfile'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import ProfileSkeleton from '../components/ui/skeletons/ProfileSkeleton'

const EDITABLE_FIELDS = [
  { key: 'name', label: 'Full name' },
  { key: 'phone', label: 'Phone' },
  { key: 'currentCity', label: 'Current city' },
  { key: 'currentCompany', label: 'Current company' },
  { key: 'designation', label: 'Designation' },
  { key: 'preferredRole', label: 'Preferred role' },
  { key: 'resumeHeadline', label: 'Resume headline' },
  { key: 'portfolioLink', label: 'Portfolio link' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
]

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
        {EDITABLE_FIELDS.map(({ key, label }) => (
          <TextField key={key} label={label} value={form[key]} onChangeText={set(key)} />
        ))}

        {(profile.skills ?? []).length > 0 ? (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>Skills</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {profile.skills.map((skill) => (
                <View key={skill} style={{ backgroundColor: colors.surfaceSunken, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 }}>
                  <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 11.5 }}>{skill}</Text>
                </View>
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
