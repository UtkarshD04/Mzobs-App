import { useState } from 'react'
import { Text, View, Switch } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/useProfile'
import { useSendTestPushMutation } from '../hooks/useNotifications'
import { useNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from '../hooks/useNotificationPreferences'
import * as authService from '../services/authService'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const PREFERENCE_CATEGORIES = [
  { key: 'applications', label: 'Applications' },
  { key: 'resume', label: 'Resume' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'training', label: 'Skill track' },
  { key: 'system', label: 'System' },
]
const CHANNELS = [
  { key: 'inApp', label: 'In-app' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
]

function ChannelToggle({ label, value, onChange }) {
  const { colors, fontFamily } = useTheme()
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 10 }}>{label}</Text>
      <Switch
        value={!!value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceSunken, true: colors.navyTintStrong }}
        thumbColor={value ? colors.navy : '#ffffff'}
        style={{ transform: [{ scale: 0.8 }] }}
      />
    </View>
  )
}

export default function SettingsScreen() {
  const { colors, spacing, fontFamily, isDark, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const { data: profile, isLoading } = useProfileQuery()
  const { data: preferences } = useNotificationPreferencesQuery()
  const updateMutation = useUpdateProfileMutation()
  const updatePreferencesMutation = useUpdateNotificationPreferencesMutation()
  const testPushMutation = useSendTestPushMutation()
  const [name, setName] = useState(null)
  const [phone, setPhone] = useState(null)
  const [saved, setSaved] = useState(false)
  const [resetState, setResetState] = useState('idle')

  if (isLoading) return <LoadingSpinner />

  function handleToggleChannel(category, channel, value) {
    updatePreferencesMutation.mutate({ [category]: { [channel]: value } })
  }

  async function handleSave() {
    setSaved(false)
    await updateMutation.mutateAsync({ name: name ?? profile.name, phone: phone ?? profile.phone })
    setSaved(true)
  }

  async function handleResetPassword() {
    setResetState('sending')
    try {
      await authService.forgotPassword(profile.email)
      setResetState('sent')
    } catch {
      setResetState('error')
    }
  }

  return (
    <ScreenContainer>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Settings</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4, marginBottom: spacing.lg }}>
        Manage your account and security.
      </Text>

      <Card>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>Appearance</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Feather name={isDark ? 'moon' : 'sun'} size={18} color={colors.navy} />
            <View>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>Dark mode</Text>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 1 }}>
                {isDark ? 'On — easier on the eyes at night' : 'Off — matches your device in daylight'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.surfaceSunken, true: colors.navyTintStrong }}
            thumbColor={isDark ? colors.navy : '#ffffff'}
          />
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>Account details</Text>
        <TextField label="Full name" value={name ?? profile.name ?? ''} onChangeText={setName} />
        <TextField label="Email" value={profile.email} editable={false} style={{ opacity: 0.6 }} />
        <TextField label="Phone" value={phone ?? profile.phone ?? ''} onChangeText={setPhone} />
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginBottom: spacing.md }}>
          Member since {fmtDate(profile.createdAt)}
        </Text>
        {saved ? <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>Saved.</Text> : null}
        <Button title="Save changes" onPress={handleSave} loading={updateMutation.isPending} />
      </Card>

      {preferences ? (
        <Card style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: 4 }}>Notification preferences</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12, marginBottom: spacing.sm }}>
            Choose how you hear about each type of update.
          </Text>
          {PREFERENCE_CATEGORIES.map((cat, i) => (
            <View
              key={cat.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.sm,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13 }}>{cat.label}</Text>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                {CHANNELS.map((ch) => (
                  <ChannelToggle
                    key={ch.key}
                    label={ch.label}
                    value={preferences[cat.key]?.[ch.key]}
                    onChange={(value) => handleToggleChannel(cat.key, ch.key, value)}
                  />
                ))}
              </View>
            </View>
          ))}
          <Button
            title="Send test notification"
            variant="secondary"
            onPress={() => testPushMutation.mutate()}
            loading={testPushMutation.isPending}
            style={{ marginTop: spacing.md }}
          />
          {testPushMutation.isSuccess ? (
            <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12, marginTop: spacing.sm }}>
              Test notification sent.
            </Text>
          ) : null}
        </Card>
      ) : null}

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: 6 }}>Password</Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>
          We'll email you a link to reset your password.
        </Text>
        {resetState === 'sent' ? (
          <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5 }}>Reset link sent — check your email.</Text>
        ) : (
          <Button
            title="Send password reset email"
            variant="secondary"
            onPress={handleResetPassword}
            loading={resetState === 'sending'}
          />
        )}
      </Card>

      <Button title="Log out" variant="danger" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  )
}
