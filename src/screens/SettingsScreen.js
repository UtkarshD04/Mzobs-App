import { useState } from 'react'
import { Text, View, Switch, Alert, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../theme'
import { useAuth } from '../context/AuthContext'
import { useProfileQuery, useUpdateProfileMutation, useDeleteAccountMutation } from '../hooks/useProfile'
import { useSendTestPushMutation } from '../hooks/useNotifications'
import { useNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from '../hooks/useNotificationPreferences'
import * as authService from '../services/authService'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import NotificationStatusCard from '../components/notifications/NotificationStatusCard'

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
  const navigation = useNavigation()
  const { data: profile, isLoading } = useProfileQuery()
  const { data: preferences } = useNotificationPreferencesQuery()
  const updateMutation = useUpdateProfileMutation()
  const updatePreferencesMutation = useUpdateNotificationPreferencesMutation()
  const testPushMutation = useSendTestPushMutation()
  const deleteAccountMutation = useDeleteAccountMutation()
  const [name, setName] = useState(null)
  const [phone, setPhone] = useState(null)
  const [saved, setSaved] = useState(false)
  const [resetState, setResetState] = useState('idle')
  const [phoneOtpState, setPhoneOtpState] = useState('idle') // idle | sending | sent | verifying | verified | error
  const [phoneOtp, setPhoneOtp] = useState('')
  const [phoneOtpError, setPhoneOtpError] = useState('')
  const [verifiedPhone, setVerifiedPhone] = useState(null)
  const [phoneToken, setPhoneToken] = useState(null)

  if (isLoading) return <LoadingSpinner />

  const phoneValue = phone ?? profile.phone ?? ''
  const phoneChanged = phone !== null && phone !== profile.phone
  const phoneValid = /^[6-9]\d{9}$/.test(phoneValue)
  const phoneReadyToSave = !phoneChanged || (verifiedPhone === phoneValue && !!phoneToken)

  function handlePhoneChange(v) {
    const digits = v.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    setSaved(false)
    // Any edit invalidates a prior OTP verification for a different number.
    setPhoneOtpState('idle')
    setPhoneOtp('')
    setPhoneOtpError('')
    setVerifiedPhone(null)
    setPhoneToken(null)
  }

  async function handleSendPhoneOtp() {
    setPhoneOtpError('')
    setPhoneOtpState('sending')
    try {
      await authService.sendOtp(phoneValue)
      setPhoneOtpState('sent')
    } catch (err) {
      setPhoneOtpError(err.response?.data?.message ?? 'Could not send OTP. Please try again.')
      setPhoneOtpState('error')
    }
  }

  async function handleVerifyPhoneOtp() {
    setPhoneOtpError('')
    setPhoneOtpState('verifying')
    try {
      const { phoneToken: token } = await authService.verifyOtp(phoneValue, phoneOtp.trim())
      setPhoneToken(token)
      setVerifiedPhone(phoneValue)
      setPhoneOtpState('verified')
    } catch (err) {
      setPhoneOtpError(err.response?.data?.message ?? 'Incorrect or expired OTP.')
      setPhoneOtpState('sent')
    }
  }

  function handleToggleChannel(category, channel, value) {
    updatePreferencesMutation.mutate({ [category]: { [channel]: value } })
  }

  async function handleSave() {
    setSaved(false)
    await updateMutation.mutateAsync({
      name: name ?? profile.name,
      phone: phoneValue,
      ...(phoneChanged ? { phoneToken } : {}),
    })
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

  function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account, applications, and all related data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync()
            } finally {
              await logout()
            }
          },
        },
      ],
    )
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
        <TextField
          label="Phone"
          value={phoneValue}
          onChangeText={handlePhoneChange}
          keyboardType="number-pad"
          maxLength={10}
        />

        {phoneChanged ? (
          phoneOtpState === 'verified' && verifiedPhone === phoneValue ? (
            <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: -4, marginBottom: spacing.md }}>
              Number verified — tap "Save changes" to update it.
            </Text>
          ) : (
            <View style={{ marginTop: -4, marginBottom: spacing.md }}>
              {!phoneValid ? (
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>
                  Enter a valid 10-digit mobile number to verify it.
                </Text>
              ) : phoneOtpState === 'sent' || phoneOtpState === 'verifying' ? (
                <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      value={phoneOtp}
                      onChangeText={(v) => setPhoneOtp(v.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit OTP"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={{ marginBottom: 0 }}
                    />
                  </View>
                  <Button
                    title="Verify"
                    onPress={handleVerifyPhoneOtp}
                    loading={phoneOtpState === 'verifying'}
                    disabled={phoneOtp.trim().length !== 6}
                    style={{ minHeight: 48 }}
                  />
                </View>
              ) : (
                <Button
                  title="Send OTP to verify new number"
                  variant="secondary"
                  onPress={handleSendPhoneOtp}
                  loading={phoneOtpState === 'sending'}
                />
              )}
              {phoneOtpError ? (
                <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 6 }}>{phoneOtpError}</Text>
              ) : null}
            </View>
          )
        ) : null}

        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginBottom: spacing.md }}>
          Member since {fmtDate(profile.createdAt)}
        </Text>
        {saved ? <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>Saved.</Text> : null}
        <Button title="Save changes" onPress={handleSave} loading={updateMutation.isPending} disabled={!phoneReadyToSave} />
      </Card>

      <NotificationStatusCard style={{ marginTop: spacing.md }} />

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
          {profile.hasPassword
            ? "We'll email you a link to reset your password."
            : "You signed in without a password (phone or Google). Set one if you'd also like to log in with your email and a password."}
        </Text>
        {resetState === 'sent' ? (
          <Text style={{ color: colors.green, fontFamily: fontFamily.regular, fontSize: 12.5 }}>
            {profile.hasPassword ? 'Reset link sent — check your email.' : 'Set-password link sent — check your email.'}
          </Text>
        ) : (
          <Button
            title={profile.hasPassword ? 'Send password reset email' : 'Set a password'}
            variant="secondary"
            onPress={handleResetPassword}
            loading={resetState === 'sending'}
          />
        )}
      </Card>

      <Card style={{ marginTop: spacing.md, paddingVertical: spacing.sm }}>
        {[
          { label: 'Privacy Policy', screen: 'PrivacyPolicy', icon: 'shield' },
          { label: 'Terms & Conditions', screen: 'TermsAndConditions', icon: 'file-text' },
        ].map((item, i) => (
          <Pressable
            key={item.screen}
            onPress={() => navigation.navigate(item.screen)}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.md,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.border,
            }}
          >
            <Feather name={item.icon} size={17} color={colors.navy} />
            <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{item.label}</Text>
            <Feather name="chevron-right" size={17} color={colors.inkTertiary} />
          </Pressable>
        ))}
      </Card>

      <Button title="Log out" variant="danger" onPress={logout} style={{ marginTop: spacing.xl }} />
      <Button
        title="Delete account"
        variant="danger"
        onPress={handleDeleteAccount}
        loading={deleteAccountMutation.isPending}
        style={{ marginTop: spacing.sm }}
      />
    </ScreenContainer>
  )
}
