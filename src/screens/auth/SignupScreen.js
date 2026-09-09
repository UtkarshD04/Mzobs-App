import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
import * as authService from '../../services/authService'
import TextField from '../../components/ui/TextField'
import SelectField from '../../components/ui/SelectField'
import Button from '../../components/ui/Button'
import ScreenContainer from '../../components/ui/ScreenContainer'
import BrandLogo from '../../components/ui/BrandLogo'

const GRADUATION_OPTIONS = [
  '12th / No Degree',
  'Diploma',
  'B.Tech / B.E.',
  'B.Sc',
  'B.Com',
  'BA',
  'BBA',
  'BCA',
  'M.Tech / M.E.',
  'MBA',
  'MCA',
  'M.Sc',
  'Other',
]

export default function SignupScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', graduation: '' })
  const [experience, setExperience] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [phoneToken, setPhoneToken] = useState(null)

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    // Phone changed after verifying — the token was minted for the old
    // number, so it can't be trusted for the new one anymore.
    if (key === 'phone') {
      setPhoneToken(null)
      setOtpSent(false)
      setOtp('')
      setOtpError('')
    }
  }
  const canSubmit =
    form.name && form.email && form.phone.length === 10 && !!phoneToken && form.password.length >= 8 && form.graduation && experience

  async function handleSendOtp() {
    setOtpError('')
    setSendingOtp(true)
    try {
      await authService.sendOtp(form.phone)
      setOtpSent(true)
    } catch (err) {
      setOtpError(err.response?.data?.message ?? 'Could not send OTP. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpError('')
    setVerifyingOtp(true)
    try {
      const { phoneToken: token } = await authService.verifyOtp(form.phone, otp)
      setPhoneToken(token)
    } catch (err) {
      setOtpError(err.response?.data?.message ?? 'Could not verify OTP. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  async function handleSignup() {
    setError('')
    setLoading(true)
    try {
      await signup({ ...form, experience, phoneToken })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'center', paddingTop: spacing.lg, marginBottom: spacing.xl }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: colors.navyTint,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Feather name="user-plus" size={24} color={colors.navy} />
          </View>
          <BrandLogo height={22} />
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, marginTop: spacing.lg }}>Create your account</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4 }}>
            Takes less than a minute
          </Text>
        </View>

        <TextField label="Full name" value={form.name} onChangeText={set('name')} placeholder="Jane Doe" />
        <TextField label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
        <TextField
          label="Phone"
          value={form.phone}
          onChangeText={(value) => set('phone')(value.replace(/\D/g, '').slice(0, 10))}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="98765 43210"
          editable={!phoneToken}
          style={{ marginBottom: phoneToken ? 4 : spacing.md }}
        />

        {phoneToken ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            <Feather name="check-circle" size={14} color={colors.green ?? '#1a9c5b'} />
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginLeft: 6 }}>
              Mobile number verified
            </Text>
          </View>
        ) : otpSent ? (
          <View style={{ marginBottom: spacing.lg }}>
            <TextField
              label="Enter OTP"
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit code"
              error={otpError}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
              <Button
                title="Verify"
                variant="secondary"
                onPress={handleVerifyOtp}
                loading={verifyingOtp}
                disabled={otp.length !== 6}
                style={{ flex: 1 }}
              />
              <Pressable onPress={handleSendOtp} disabled={sendingOtp} hitSlop={8}>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.medium, fontSize: 12.5 }}>
                  {sendingOtp ? 'Resending…' : 'Resend OTP'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ marginBottom: spacing.lg }}>
            <Button
              title="Send OTP"
              variant="secondary"
              onPress={handleSendOtp}
              loading={sendingOtp}
              disabled={form.phone.length !== 10}
            />
            {otpError ? (
              <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 6 }}>{otpError}</Text>
            ) : null}
          </View>
        )}

        <SelectField
          label="Highest graduation"
          value={form.graduation}
          onChange={set('graduation')}
          options={GRADUATION_OPTIONS}
          placeholder="Select your graduation"
        />
        <TextField label="Password" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="At least 8 characters" />

        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 8 }}>
          Experience level <Text style={{ color: colors.red }}>*</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          {[
            { key: 'fresher', label: 'Fresher' },
            { key: 'experienced', label: 'Experienced' },
          ].map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setExperience(opt.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: experience === opt.key }}
              style={{
                flex: 1,
                minHeight: 44,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: experience === opt.key ? colors.navy : colors.border,
                backgroundColor: experience === opt.key ? colors.navyTint : colors.surface,
              }}
            >
              <Text style={{ color: experience === opt.key ? colors.navy : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button title="Create Account" onPress={handleSignup} loading={loading} disabled={!canSubmit} style={{ marginTop: spacing.xs }} />

        <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.lg, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
            Already have an account? <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>Sign in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
