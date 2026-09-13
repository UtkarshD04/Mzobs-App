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
import AuthBubbleField from '../../components/decor/AuthBubbleField'

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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STEPS = ['Account', 'Mobile number']

// Two-step flow (Account -> Mobile number) mirrors Website/Landing-Frontend's
// EmployeeSignupForm.jsx exactly, so the mobile signup journey matches the
// website's instead of being a single flat form in a different field order.
function StepProgress({ step }) {
  const { colors, spacing, fontFamily } = useTheme()
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
      {STEPS.map((label, i) => {
        const active = i + 1 <= step
        return (
          <View key={label} style={{ flex: 1 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: active ? colors.navy : colors.border, marginBottom: 6 }} />
            <Text style={{ color: active ? colors.navy : colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11 }}>{label}</Text>
          </View>
        )
      })}
    </View>
  )
}

export default function SignupScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { signup } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', graduation: '' })
  const [experience, setExperience] = useState(null)
  const [stepError, setStepError] = useState('')
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

  const canContinue = form.name.trim() && form.email.trim() && form.password.length >= 8
  // Matches the website: phone verification, graduation and experience level
  // are all optional — the backend only requires name/email/phone/password
  // (Backend/src/controllers/employeeAuthController.js signup — "Phone OTP
  // verification is optional, proceed either way, just record whether it was
  // actually verified"). Blocking on phoneToken would make signup impossible
  // whenever SMS isn't configured (e.g. no MSG91_AUTH_KEY), which the website
  // never does.
  const canSubmit = form.phone.length === 10

  function handleContinue() {
    setStepError('')
    if (!form.name.trim()) return setStepError('Please enter your full name.')
    if (!EMAIL_RE.test(form.email.trim())) return setStepError('Enter a valid email address.')
    if (form.password.length < 8) return setStepError('Password must be at least 8 characters.')
    setStep(2)
  }

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
              position: 'relative',
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: colors.navyTint,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <AuthBubbleField />
            <Feather name="user-plus" size={24} color={colors.navy} />
          </View>
          <BrandLogo height={22} />
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, marginTop: spacing.lg, textAlign: 'center' }}>
            Your next opportunity starts here.
          </Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            Create your profile and get matched with verified employers.
          </Text>
        </View>

        {step === 1 ? (
          <Pressable onPress={() => navigation.navigate('Login')} style={{ marginBottom: spacing.lg, minHeight: 32, justifyContent: 'center' }}>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, textAlign: 'center' }}>
              Already have an account? <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>Sign in</Text>
            </Text>
          </Pressable>
        ) : null}

        <StepProgress step={step} />

        {step === 1 ? (
          <>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15, marginBottom: spacing.md }}>Account details</Text>

            <TextField label="Full name" value={form.name} onChangeText={set('name')} placeholder="Jane Doe" />
            <TextField
              label="Email"
              value={form.email}
              onChangeText={set('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <TextField
              label="Password"
              value={form.password}
              onChangeText={set('password')}
              secureTextEntry
              placeholder="Create a password"
            />
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: -8, marginBottom: spacing.lg }}>
              At least 8 characters.
            </Text>

            <SelectField
              label="Highest graduation (optional)"
              value={form.graduation}
              onChange={set('graduation')}
              options={GRADUATION_OPTIONS}
              placeholder="Select your graduation"
            />

            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 8 }}>
              Experience level (optional)
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

            {stepError ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{stepError}</Text> : null}

            <Button title="Continue →" onPress={handleContinue} disabled={!canContinue} />
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Pressable onPress={() => setStep(1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
                <Feather name="arrow-left" size={18} color={colors.inkSecondary} />
              </Pressable>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15 }}>Mobile number</Text>
            </View>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>
              So employers can reach you about your applications.
            </Text>

            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>Mobile number</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: phoneToken ? 4 : spacing.md }}>
              <View
                style={{
                  minHeight: 48,
                  paddingHorizontal: spacing.md,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.bgSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 14.5 }}>+91</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  value={form.phone}
                  onChangeText={(value) => set('phone')(value.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="98765 43210"
                  editable={!phoneToken}
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

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
                  label="Enter the 6-digit code"
                  value={otp}
                  onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="6-digit code"
                  error={otpError}
                />
                <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                  <Button
                    title="Verify code"
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
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 6 }}>
                  Optional — you can verify your number later too.
                </Text>
                {otpError ? (
                  <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 6 }}>{otpError}</Text>
                ) : null}
              </View>
            )}

            {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

            <Button title="Create account" onPress={handleSignup} loading={loading} disabled={!canSubmit} />

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: spacing.md }}>
              <Feather name="shield" size={13} color={colors.teal} style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, lineHeight: 16 }}>
                Your profile is private. Employers see it only when you apply or are matched for a relevant role.
              </Text>
            </View>
          </>
        )}

        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11, textAlign: 'center', marginTop: spacing.lg, lineHeight: 16 }}>
          By signing up, you agree to Mzobs' Terms of Service and Privacy Policy.
        </Text>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
