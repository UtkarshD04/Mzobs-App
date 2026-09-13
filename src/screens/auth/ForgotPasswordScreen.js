import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { forgotPassword } from '../../services/authService'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import ScreenContainer from '../../components/ui/ScreenContainer'

export default function ForgotPasswordScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setSent(true)
    } catch {
      // Mirrors the website's EmployeeForgotPassword — always show the
      // generic success state so this never leaks whether an account exists.
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'center', paddingTop: spacing.xl, marginBottom: spacing.xl }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: colors.navyTint,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Feather name={sent ? 'check-circle' : 'lock'} size={28} color={colors.navy} />
          </View>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, marginTop: spacing.lg }}>
            {sent ? 'Check your email' : 'Forgot password?'}
          </Text>
          <Text
            style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, textAlign: 'center' }}
          >
            {sent
              ? 'If an account exists for that email, we’ve sent instructions to reset your password.'
              : 'Enter the email on your account and we’ll send you a link to reset your password.'}
          </Text>
        </View>

        {sent ? (
          <Button title="Back to Sign In" onPress={() => navigation.navigate('Login')} />
        ) : (
          <>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />

            {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

            <Button title="Send reset link" onPress={handleSubmit} loading={loading} disabled={!email} style={{ marginTop: spacing.sm }} />

            <Pressable onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
                Back to <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>Sign In</Text>
              </Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
