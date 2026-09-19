import { useEffect, useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable, Linking } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
import { googleSignIn } from '../../lib/googleSignIn'
import { tokenStore } from '../../lib/api'
import { useUploadResumeMutation } from '../../hooks/useResume'
import * as authService from '../../services/authService'
import { WIDGET_CONFIGURED, WidgetError, sendWidgetOtp, retryWidgetOtp, verifyWidgetOtp } from '../../lib/msg91Widget'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import GoogleAuthButton, { OrDivider } from '../../components/ui/GoogleAuthButton'
import ScreenContainer from '../../components/ui/ScreenContainer'
import BrandLogo from '../../components/ui/BrandLogo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_COOLDOWN = 30
const TERMS_URL = 'https://mzobs.com/terms-of-service'
const PRIVACY_URL = 'https://mzobs.com/privacy-policy'

// MSG91 widget failures carry their own readable message; anything else is an
// axios error, whose backend message (if the request got that far) wins.
function errorMessage(err, fallback) {
  if (err instanceof WidgetError) return err.message
  return err.response?.data?.message ?? fallback
}

function logError(label, err) {
  // A missing err.response means the request never reached the server at all
  // (wrong API host, no network) — logged since that looks identical to a
  // real backend error in the on-screen message alone.
  console.error(label, err.response ? { status: err.response.status, data: err.response.data } : err.message)
}

// A single phone-first entry point (no separate Login/Signup screens, no
// password anywhere) — matches consumer apps like cult.fit: enter your
// number, verify the OTP, and the backend tells us whether that's an
// existing account (straight in) or a new one (collect name/email, then
// resume). AuthStack.js points both its "Login" and "Signup" routes at this
// same screen.
export default function PhoneAuthScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { completeSession } = useAuth()
  const uploadResumeMutation = useUploadResumeMutation()

  const [step, setStep] = useState('phone') // 'phone' | 'otp' | 'profile' | 'resume'
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const [googleCredential, setGoogleCredential] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const [otp, setOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [checkingAccount, setCheckingAccount] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [phoneToken, setPhoneToken] = useState(null)
  const [reqId, setReqId] = useState(null)
  const [resendIn, setResendIn] = useState(0)

  const [creatingAccount, setCreatingAccount] = useState(false)

  // Step 'resume' — the account already exists and its token is already
  // persisted by the time this step shows, so resume upload here hits the
  // API authenticated exactly like it would from the Resume Center tab.
  // completeSession() only runs once this step is done (uploaded or
  // skipped), which is what actually enters the app.
  const [pendingSession, setPendingSession] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  function resetToPhoneStep() {
    setStep('phone')
    setOtp('')
    setOtpError('')
    setInfoMessage('')
    setPhoneToken(null)
    setReqId(null)
    setResendIn(0)
  }

  function handlePhoneChange(value) {
    setPhone(value.replace(/\D/g, '').slice(0, 10))
  }

  async function handleSendOtp() {
    setError('')
    setOtpError('')
    setSendingOtp(true)
    try {
      if (WIDGET_CONFIGURED) {
        const { reqId: id, accessToken } = await sendWidgetOtp(phone)
        setReqId(id)
        setStep('otp')
        setOtp('')
        setResendIn(RESEND_COOLDOWN)
        // Invisible OTP: MSG91 already verified this device, no SMS was sent.
        if (accessToken) await verifyWithAccessToken(accessToken)
      } else {
        await authService.sendOtp(phone)
        setStep('otp')
        setOtp('')
        setResendIn(RESEND_COOLDOWN)
      }
    } catch (err) {
      logError('sendOtp failed', err)
      setError(errorMessage(err, 'Could not send OTP. Please try again.'))
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleResendOtp() {
    setOtpError('')
    setSendingOtp(true)
    try {
      if (WIDGET_CONFIGURED) await retryWidgetOtp(reqId)
      else await authService.sendOtp(phone)
      setOtp('')
      setResendIn(RESEND_COOLDOWN)
    } catch (err) {
      logError('resendOtp failed', err)
      setOtpError(errorMessage(err, 'Could not resend OTP. Please try again.'))
    } finally {
      setSendingOtp(false)
    }
  }

  // The widget's access-token proves the number to MSG91; the backend
  // re-confirms it with MSG91 before minting the phoneToken everything else
  // (phone-login, signup) trusts.
  async function verifyWithAccessToken(accessToken) {
    const { phoneToken: token } = await authService.verifyPhoneWidget(phone, accessToken)
    setPhoneToken(token)
    await proceedAfterVerification(token)
  }

  // Signs an existing account straight in with nothing but the verified
  // phoneToken. A 404 just means this number has never signed up — that's
  // the expected branch into "collect a name/email" (or, for a new Google
  // user, straight into signup since we already have those from Google).
  async function proceedAfterVerification(token) {
    setCheckingAccount(true)
    try {
      const { token: authToken, employee } = await authService.phoneLogin(phone, token)
      await tokenStore.set(authToken)
      // Standard wording apps use when a "new" number turns out to already
      // have an account — brief visible confirmation before signing them
      // straight in, instead of jumping into the app with no explanation.
      setInfoMessage('This mobile number is already registered. Signing you in…')
      setTimeout(() => completeSession(authToken, employee), 900)
    } catch (err) {
      if (err.response?.status === 404) {
        if (googleCredential) await finishSignup(token)
        else setStep('profile')
      } else {
        logError('phoneLogin failed', err)
        setOtpError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
      }
    } finally {
      setCheckingAccount(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpError('')
    setInfoMessage('')
    setVerifyingOtp(true)
    try {
      if (WIDGET_CONFIGURED) {
        await verifyWithAccessToken(await verifyWidgetOtp(reqId, otp))
      } else {
        const { phoneToken: token } = await authService.verifyOtp(phone, otp)
        setPhoneToken(token)
        await proceedAfterVerification(token)
      }
    } catch (err) {
      logError('verifyOtp failed', err)
      setOtpError(errorMessage(err, 'Could not verify OTP. Please try again.'))
    } finally {
      setVerifyingOtp(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const result = await googleSignIn()
      if (!result) return
      try {
        const { token, employee } = await authService.googleLogin(result.idToken)
        await tokenStore.set(token)
        completeSession(token, employee)
        return
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message ?? 'Google sign-in failed. Please try again.')
          return
        }
      }
      // No account for this Google email yet — still need a verified phone
      // number (mandatory once SMS is configured), so stay on this step and
      // let them enter it; name/email are already known from Google.
      setGoogleCredential(result.idToken)
      setName(result.name || '')
      setEmail(result.email || '')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function finishSignup(token) {
    setError('')
    setCreatingAccount(true)
    try {
      const { token: authToken, employee } = googleCredential
        ? await authService.googleSignup({ credential: googleCredential, phone, phoneToken: token })
        : await authService.signup({ name: name.trim(), email: email.trim(), phone, phoneToken: token })
      await tokenStore.set(authToken)
      setPendingSession({ token: authToken, employee })
      setStep('resume')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setCreatingAccount(false)
    }
  }

  function handleContinueProfile() {
    setError('')
    if (!name.trim()) return setError('Please enter your full name.')
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    finishSignup(phoneToken)
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

  const canSendOtp = phone.length === 10
  const canVerifyOtp = otp.length === 6
  const verifyBusy = verifyingOtp || checkingAccount

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'center', paddingTop: spacing.lg, marginBottom: spacing.lg }}>
          <BrandLogo height={40} />
        </View>

        <Card style={{ padding: spacing.lg }}>
        {step === 'phone' ? (
          <>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, textAlign: 'center' }}>
              Find your next job faster
            </Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, marginBottom: spacing.lg, textAlign: 'center' }}>
              Enter your mobile number to sign in or create an account.
            </Text>

            {googleCredential ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Feather name="check-circle" size={14} color={colors.green} />
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginLeft: 6 }} numberOfLines={1}>
                  Signing up as {name || email} via Google
                </Text>
              </View>
            ) : null}

            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5, marginBottom: 6 }}>Mobile number</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
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
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="98765 43210"
                  autoFocus
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>

            {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

            <Button title="Send OTP" onPress={handleSendOtp} loading={sendingOtp} disabled={!canSendOtp} />

            <OrDivider label="or continue with Google" />
            <GoogleAuthButton onPress={handleGoogle} loading={googleLoading} disabled={sendingOtp} />

            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: spacing.xl }}>
              By continuing, you agree to Mzobs'{' '}
              <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }} onPress={() => Linking.openURL(TERMS_URL)}>
                Terms & Conditions
              </Text>{' '}
              and{' '}
              <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }} onPress={() => Linking.openURL(PRIVACY_URL)}>
                Privacy Policy
              </Text>
              .
            </Text>
          </>
        ) : step === 'otp' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Pressable onPress={resetToPhoneStep} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
                <Feather name="arrow-left" size={18} color={colors.inkSecondary} />
              </Pressable>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18 }}>Verify your number</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <Text style={{ flex: 1, color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
                Enter the 6-digit code sent to +91 {phone}
              </Text>
              <Pressable onPress={resetToPhoneStep} hitSlop={8}>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>Change</Text>
              </Pressable>
            </View>

            <TextField
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit code"
              autoFocus
              error={otpError}
              style={{ marginBottom: spacing.lg }}
              inputStyle={{ fontSize: 22, letterSpacing: 8, textAlign: 'center', fontFamily: fontFamily.bold }}
            />

            {infoMessage ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md }}>
                <Feather name="check-circle" size={13} color={colors.green} />
                <Text style={{ color: colors.green, fontFamily: fontFamily.medium, fontSize: 12.5 }}>{infoMessage}</Text>
              </View>
            ) : null}

            <Button title="Verify & continue" onPress={handleVerifyOtp} loading={verifyBusy} disabled={!canVerifyOtp} />

            <Pressable
              onPress={handleResendOtp}
              disabled={sendingOtp || resendIn > 0}
              hitSlop={8}
              style={{ alignSelf: 'center', marginTop: spacing.lg, minHeight: 32, justifyContent: 'center' }}
            >
              <Text style={{ color: sendingOtp || resendIn > 0 ? colors.inkTertiary : colors.navy, fontFamily: fontFamily.medium, fontSize: 13 }}>
                {sendingOtp ? 'Resending…' : resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, '0')}` : 'Resend OTP'}
              </Text>
            </Pressable>
          </>
        ) : step === 'profile' ? (
          <>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, textAlign: 'center' }}>
              Tell us about yourself
            </Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, marginBottom: spacing.lg, textAlign: 'center' }}>
              So employers know who's applying.
            </Text>

            <TextField label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" autoFocus />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />

            {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

            <Button
              title="Continue"
              onPress={handleContinueProfile}
              loading={creatingAccount}
              disabled={!name.trim() || !email.trim()}
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.md,
                padding: spacing.md,
                borderRadius: 10,
                backgroundColor: colors.navyTint,
              }}
            >
              <Feather name="check-circle" size={18} color={colors.navy} />
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
        </Card>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
