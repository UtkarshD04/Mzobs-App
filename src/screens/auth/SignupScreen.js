import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable, Linking } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
import { googleSignIn } from '../../lib/googleSignIn'
import { tokenStore } from '../../lib/api'
import { useUploadResumeMutation } from '../../hooks/useResume'
import * as authService from '../../services/authService'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import GoogleAuthButton, { OrDivider } from '../../components/ui/GoogleAuthButton'
import ScreenContainer from '../../components/ui/ScreenContainer'
import BrandLogo from '../../components/ui/BrandLogo'
import AuthBubbleField from '../../components/decor/AuthBubbleField'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STEPS = ['Account', 'Mobile number', 'Resume']
const TERMS_URL = 'https://mzobs.com/terms-of-service'
const PRIVACY_URL = 'https://mzobs.com/privacy-policy'

// Three-step flow (Account -> Mobile number -> Resume) mirrors Website/
// Landing-Frontend's EmployeeSignupForm.jsx exactly, so the mobile signup
// journey matches the website's instead of being a single flat form in a
// different field order.
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
  const { completeSession } = useAuth()
  const uploadResumeMutation = useUploadResumeMutation()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [stepError, setStepError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleCredential, setGoogleCredential] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const [agreed, setAgreed] = useState(false)

  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [phoneToken, setPhoneToken] = useState(null)

  // Step 3 (Resume) — the account already exists and its token is already
  // persisted (see handleSignup) by the time this step shows, so resume
  // upload here hits the API authenticated exactly like it would from the
  // Resume Center tab. completeSession() only runs once this step is done
  // (uploaded or skipped), which is what actually enters the app.
  const [pendingSession, setPendingSession] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')

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
  // Matches the website: phone verification is optional — the backend only
  // requires name/email/phone/password (Backend/src/controllers/
  // employeeAuthController.js signup — "Phone OTP verification is optional,
  // proceed either way, just record whether it was actually verified").
  // Blocking on phoneToken would make signup impossible whenever SMS isn't
  // configured (e.g. no MSG91_AUTH_KEY), which the website never does.
  const canSubmit = form.phone.length === 10 && agreed

  function handleContinue() {
    setStepError('')
    if (!form.name.trim()) return setStepError('Please enter your full name.')
    if (!EMAIL_RE.test(form.email.trim())) return setStepError('Enter a valid email address.')
    if (form.password.length < 8) return setStepError('Password must be at least 8 characters.')
    setGoogleCredential(null)
    setStep(2)
  }

  async function handleGoogleSignup() {
    setStepError('')
    setGoogleLoading(true)
    try {
      const result = await googleSignIn()
      if (!result) return
      setForm((f) => ({ ...f, name: result.name || f.name, email: result.email || f.email }))
      setGoogleCredential(result.idToken)
      setStep(2)
    } catch (err) {
      setStepError(err.response?.data?.message ?? 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
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

  // Calls the signup API directly (not through AuthContext) and persists the
  // token immediately — that's enough for an authenticated request (the resume
  // upload below) without yet flipping isAuthenticated, so the user still
  // sees this wizard's Resume step instead of RootNavigator swapping them
  // straight into the app.
  async function handleSignup() {
    setError('')
    setLoading(true)
    try {
      const { token, employee } = googleCredential
        ? await authService.googleSignup({ credential: googleCredential, phone: form.phone, phoneToken })
        : await authService.signup({ ...form, phoneToken })
      await tokenStore.set(token)
      setPendingSession({ token, employee })
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePickResume() {
    setResumeError('')
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      })
      if (result.canceled) return
      setResumeFile(result.assets[0])
    } catch {
      setResumeError('Could not open the file picker. Please try again.')
    }
  }

  async function handleUploadResume() {
    if (!resumeFile) return
    setResumeError('')
    try {
      await uploadResumeMutation.mutateAsync(resumeFile)
      completeSession(pendingSession.token, pendingSession.employee)
    } catch (err) {
      setResumeError(err.response?.data?.message ?? 'Upload failed. You can add your resume later.')
    }
  }

  function handleSkipResume() {
    completeSession(pendingSession.token, pendingSession.employee)
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'center', paddingTop: spacing.lg, marginBottom: spacing.xl }}>
          <View style={{ position: 'relative', height: 44, width: 44 * (5000 / 2725), alignItems: 'center', justifyContent: 'center' }}>
            <AuthBubbleField />
            <BrandLogo height={44} />
          </View>
          <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5, letterSpacing: 0.2, marginTop: spacing.md, textAlign: 'center' }}>
            Where verified talent meets real work.
          </Text>
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

            <GoogleAuthButton label="Continue with Google" onPress={handleGoogleSignup} loading={googleLoading} />
            <OrDivider label="or sign up with email" />

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

            {stepError ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{stepError}</Text> : null}

            <Button title="Continue →" onPress={handleContinue} disabled={!canContinue} />
          </>
        ) : step === 2 ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Pressable onPress={() => setStep(1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
                <Feather name="arrow-left" size={18} color={colors.inkSecondary} />
              </Pressable>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15 }}>Mobile number</Text>
            </View>
            {googleCredential ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Feather name="check-circle" size={14} color={colors.green ?? '#1a9c5b'} />
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginLeft: 6 }} numberOfLines={1}>
                  Signing up as {form.email} via Google
                </Text>
              </View>
            ) : null}
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

            <Checkbox checked={agreed} onChange={setAgreed}>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, lineHeight: 17 }}>
                I agree to Mzobs'{' '}
                <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }} onPress={() => Linking.openURL(TERMS_URL)}>
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }} onPress={() => Linking.openURL(PRIVACY_URL)}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </Checkbox>

            <Button title="Create account" onPress={handleSignup} loading={loading} disabled={!canSubmit} style={{ marginTop: spacing.md }} />

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: spacing.md }}>
              <Feather name="shield" size={13} color={colors.teal} style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, lineHeight: 16 }}>
                Your profile is private. Employers see it only when you apply or are matched for a relevant role.
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, padding: spacing.md, borderRadius: 10, backgroundColor: colors.tealTint ?? colors.navyTint }}>
              <Feather name="check-circle" size={18} color={colors.teal ?? colors.navy} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 13.5 }}>Account created successfully!</Text>
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12 }}>Now upload your resume so employers can find you.</Text>
              </View>
            </View>

            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15, marginBottom: spacing.md }}>Upload your resume</Text>

            {resumeFile ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: spacing.md,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.bgSecondary,
                  marginBottom: spacing.md,
                }}
              >
                <Feather name="file-text" size={18} color={colors.navy} />
                <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }} numberOfLines={1}>
                  {resumeFile.name}
                </Text>
                <Pressable onPress={() => setResumeFile(null)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove">
                  <Feather name="trash-2" size={16} color={colors.inkSecondary} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickResume}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: spacing.md,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: colors.border,
                  backgroundColor: colors.bgSecondary,
                  marginBottom: spacing.md,
                }}
              >
                <Feather name="upload-cloud" size={20} color={colors.inkSecondary} />
                <View>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>Click to upload your CV</Text>
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5 }}>PDF or DOC — up to 5MB</Text>
                </View>
              </Pressable>
            )}

            {resumeError ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>{resumeError}</Text> : null}

            <Button
              title="Upload CV"
              onPress={handleUploadResume}
              loading={uploadResumeMutation.isPending}
              disabled={!resumeFile || uploadResumeMutation.isPending}
            />
            <Pressable onPress={handleSkipResume} hitSlop={8} style={{ marginTop: spacing.md, alignSelf: 'center' }} disabled={uploadResumeMutation.isPending}>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13 }}>Skip for now</Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
