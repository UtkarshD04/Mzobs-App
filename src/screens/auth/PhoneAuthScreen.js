import { useEffect, useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
import { tokenStore } from '../../lib/api'
import { useUploadResumeMutation } from '../../hooks/useResume'
import * as authService from '../../services/authService'
import { WIDGET_CONFIGURED, WidgetError, sendWidgetOtp, retryWidgetOtp, verifyWidgetOtp } from '../../lib/msg91Widget'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Checkbox from '../../components/ui/Checkbox'
import ScreenContainer from '../../components/ui/ScreenContainer'
import BrandLogo from '../../components/ui/BrandLogo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RESEND_COOLDOWN = 30
const TERMS_REQUIRED_MESSAGE = 'Please accept the Terms & Conditions and Privacy Policy to continue.'

// Mandatory consent tick, shown only where a NEW account is about to be
// created (the profile step). Existing
// accounts signing in never see it.
function TermsConsent({ checked, onChange }) {
  const { colors, spacing, fontFamily } = useTheme()
  const navigation = useNavigation()
  const linkStyle = { color: colors.navy, fontFamily: fontFamily.semibold, textDecorationLine: 'underline' }
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Checkbox checked={checked} onChange={onChange}>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, lineHeight: 18 }}>
          I have read and agree to the Mzobs{' '}
          <Text style={linkStyle} onPress={() => navigation.navigate('TermsAndConditions')}>
            Terms & Conditions
          </Text>{' '}
          and{' '}
          <Text style={linkStyle} onPress={() => navigation.navigate('PrivacyPolicy')}>
            Privacy Policy
          </Text>
          .
        </Text>
      </Checkbox>
    </View>
  )
}

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

// A single entry point for both signing in and signing up (no separate
// Login/Signup screens, no password anywhere). Two ways in:
//   - mobile number: verify the OTP; an existing account opens straight away, a new
//     number collects name + email, then a resume.
//   - email ("Continue with Email"): verify a code emailed to you; an existing account
//     opens straight away, a new email collects name + mobile number, the number is
//     verified with an OTP too, then a resume.
// Either way, if the number OR the email already belongs to an account, that account
// opens instead of a duplicate being created. AuthStack.js points both its "Login" and
// "Signup" routes at this same screen.
export default function PhoneAuthScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const { completeSession } = useAuth()
  const uploadResumeMutation = useUploadResumeMutation()

  // 'phone' | 'otp' | 'profile' | 'resume'  (mobile number path)
  // 'email' | 'emailOtp' | 'emailProfile'     (email path; a new email then reuses 'otp' to verify the number)
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)


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

  // Email path: proof the address was verified (sent along with signup).
  const [emailToken, setEmailToken] = useState(null)
  const [emailOtp, setEmailOtp] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailError, setEmailError] = useState('')

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
    // In the email path the number step is 'emailProfile' (name + number); going
    // "back" from its OTP screen should return there, not drop the verified email.
    setStep(emailToken ? 'emailProfile' : 'phone')
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
  // the expected branch into "collect a name/email".
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
        // Email path already has name + verified email, so the account can be created now;
        // the number path still needs to ask for them.
        if (emailToken) await finishSignup(token)
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

  async function finishSignup(token) {
    setError('')
    if (!acceptedTerms) {
      setError(TERMS_REQUIRED_MESSAGE)
      return
    }
    setCreatingAccount(true)
    try {
      const { token: authToken, employee } = await authService.signup({ name: name.trim(), email: email.trim(), phone, phoneToken: token, emailToken: emailToken ?? undefined })
      await tokenStore.set(authToken)
      setPendingSession({ token: authToken, employee })
      setStep('resume')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setCreatingAccount(false)
    }
  }

  // ── Email path ────────────────────────────────────────────────────────────
  function startEmailFlow() {
    setError('')
    setEmailError('')
    setEmailOtp('')
    setEmailToken(null)
    setStep('email')
  }

  function leaveEmailFlow() {
    setEmailToken(null)
    setEmailOtp('')
    setEmailError('')
    setError('')
    setInfoMessage('')
    setResendIn(0)
    setStep('phone')
  }

  async function handleSendEmailCode() {
    setEmailError('')
    if (!EMAIL_RE.test(email.trim())) return setEmailError('Enter a valid email address.')
    setEmailBusy(true)
    try {
      await authService.sendEmailOtp(email.trim())
      setStep('emailOtp')
      setEmailOtp('')
      setResendIn(RESEND_COOLDOWN)
    } catch (err) {
      logError('sendEmailOtp failed', err)
      setEmailError(errorMessage(err, 'Could not send the code. Please try again.'))
    } finally {
      setEmailBusy(false)
    }
  }

  async function handleResendEmailCode() {
    setEmailError('')
    setEmailBusy(true)
    try {
      await authService.sendEmailOtp(email.trim())
      setEmailOtp('')
      setResendIn(RESEND_COOLDOWN)
    } catch (err) {
      logError('resend email code failed', err)
      setEmailError(errorMessage(err, 'Could not resend the code. Please try again.'))
    } finally {
      setEmailBusy(false)
    }
  }

  // Verifies the emailed code, then opens the account for that address — or, if there
  // isn't one (404), moves on to collecting name + mobile number for a new account.
  async function handleVerifyEmailCode() {
    setEmailError('')
    setInfoMessage('')
    setEmailBusy(true)
    try {
      const { emailToken: verified } = await authService.verifyEmailOtp(email.trim(), emailOtp)
      setEmailToken(verified)
      try {
        const { token: authToken, employee } = await authService.emailLogin(email.trim(), verified)
        await tokenStore.set(authToken)
        setInfoMessage('This email is already registered. Signing you in…')
        setTimeout(() => completeSession(authToken, employee), 900)
      } catch (err) {
        if (err.response?.status === 404) setStep('emailProfile')
        else throw err
      }
    } catch (err) {
      logError('verifyEmailOtp failed', err)
      setEmailError(errorMessage(err, 'Could not verify the code. Please try again.'))
    } finally {
      setEmailBusy(false)
    }
  }

  // New email: we still need a verified mobile number (recruiters call it), so verify it
  // with the same OTP step the number path uses.
  function handleContinueEmailProfile() {
    setError('')
    if (!name.trim()) return setError('Please enter your full name.')
    if (phone.length !== 10) return setError('Enter your 10-digit mobile number.')
    if (!acceptedTerms) return setError(TERMS_REQUIRED_MESSAGE)
    handleSendOtp()
  }

  function handleContinueProfile() {
    setError('')
    if (!name.trim()) return setError('Please enter your full name.')
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    if (!acceptedTerms) return setError(TERMS_REQUIRED_MESSAGE)
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

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 12.5 }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </View>
            <Pressable
              onPress={startEmailFlow}
              accessibilityRole="button"
              accessibilityLabel="Continue with Email"
              style={{
                minHeight: 48,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Feather name="mail" size={18} color={colors.ink} />
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5 }}>Continue with Email</Text>
            </Pressable>

            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: spacing.xl }}>
              By continuing, you agree to Mzobs'{' '}
              <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }} onPress={() => navigation.navigate('TermsAndConditions')}>
                Terms & Conditions
              </Text>{' '}
              and{' '}
              <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }} onPress={() => navigation.navigate('PrivacyPolicy')}>
                Privacy Policy
              </Text>
              .
            </Text>
          </>
        ) : step === 'email' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Pressable onPress={leaveEmailFlow} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
                <Feather name="arrow-left" size={18} color={colors.inkSecondary} />
              </Pressable>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18 }}>Continue with Email</Text>
            </View>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginBottom: spacing.lg }}>
              Enter your email and we will send you a 6-digit code. If you already have an account it opens, otherwise we will create one.
            </Text>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              autoFocus
              error={emailError}
            />
            <Button title="Send code" onPress={handleSendEmailCode} loading={emailBusy} disabled={!email.trim()} style={{ marginTop: spacing.sm }} />
            <Pressable onPress={leaveEmailFlow} hitSlop={8} style={{ alignSelf: 'center', marginTop: spacing.lg }}>
              <Text style={{ color: colors.navy, fontFamily: fontFamily.medium, fontSize: 13 }}>Use mobile number instead</Text>
            </Pressable>
          </>
        ) : step === 'emailOtp' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Pressable onPress={() => setStep('email')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
                <Feather name="arrow-left" size={18} color={colors.inkSecondary} />
              </Pressable>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18 }}>Verify your email</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <Text style={{ flex: 1, color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
                Enter the 6-digit code sent to {email.trim()}
              </Text>
              <Pressable onPress={() => setStep('email')} hitSlop={8}>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>Change</Text>
              </Pressable>
            </View>

            <TextField
              value={emailOtp}
              onChangeText={(value) => setEmailOtp(value.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="6-digit code"
              autoFocus
              error={emailError}
              style={{ marginBottom: spacing.lg }}
              inputStyle={{ fontSize: 22, letterSpacing: 8, textAlign: 'center', fontFamily: fontFamily.bold }}
            />

            {infoMessage ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md }}>
                <Feather name="check-circle" size={13} color={colors.green} />
                <Text style={{ color: colors.green, fontFamily: fontFamily.medium, fontSize: 12.5 }}>{infoMessage}</Text>
              </View>
            ) : null}

            <Button title="Verify & continue" onPress={handleVerifyEmailCode} loading={emailBusy} disabled={emailOtp.length !== 6} />

            <Pressable
              onPress={handleResendEmailCode}
              disabled={emailBusy || resendIn > 0}
              hitSlop={8}
              style={{ alignSelf: 'center', marginTop: spacing.lg, minHeight: 32, justifyContent: 'center' }}
            >
              <Text style={{ color: emailBusy || resendIn > 0 ? colors.inkTertiary : colors.navy, fontFamily: fontFamily.medium, fontSize: 13 }}>
                {emailBusy ? 'Sending…' : resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, '0')}` : 'Resend code'}
              </Text>
            </Pressable>
          </>
        ) : step === 'emailProfile' ? (
          <>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, textAlign: 'center' }}>Almost there</Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, marginBottom: spacing.lg, textAlign: 'center' }}>
              {email.trim()} is verified. Add your name and mobile number so employers can reach you.
            </Text>

            <TextField label="Full name" value={name} onChangeText={setName} placeholder="Jane Doe" autoFocus />
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}>
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
                  marginBottom: spacing.md,
                }}
              >
                <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 14.5 }}>+91</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Mobile number" value={phone} onChangeText={handlePhoneChange} keyboardType="phone-pad" maxLength={10} placeholder="98765 43210" />
              </View>
            </View>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginBottom: spacing.md }}>
              We will send an OTP to this number to verify it.
            </Text>

            <TermsConsent checked={acceptedTerms} onChange={setAcceptedTerms} />

            {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

            <Button
              title="Send OTP"
              onPress={handleContinueEmailProfile}
              loading={sendingOtp}
              disabled={!name.trim() || phone.length !== 10 || !acceptedTerms}
              style={{ marginTop: spacing.sm }}
            />
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

            <TermsConsent checked={acceptedTerms} onChange={setAcceptedTerms} />

            {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

            <Button
              title="Continue"
              onPress={handleContinueProfile}
              loading={creatingAccount}
              disabled={!name.trim() || !email.trim() || !acceptedTerms}
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
