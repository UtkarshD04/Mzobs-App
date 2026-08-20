import { useState } from 'react'
import { Text } from 'react-native'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/useProfile'
import * as authService from '../services/authService'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function SettingsScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { logout } = useAuth()
  const { data: profile, isLoading } = useProfileQuery()
  const updateMutation = useUpdateProfileMutation()
  const [name, setName] = useState(null)
  const [phone, setPhone] = useState(null)
  const [saved, setSaved] = useState(false)
  const [resetState, setResetState] = useState('idle')

  if (isLoading) return <LoadingSpinner />

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
