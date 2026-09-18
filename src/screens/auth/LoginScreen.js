import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
import { googleSignIn } from '../../lib/googleSignIn'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import GoogleAuthButton, { OrDivider } from '../../components/ui/GoogleAuthButton'
import ScreenContainer from '../../components/ui/ScreenContainer'
import BrandLogo from '../../components/ui/BrandLogo'
import AuthBubbleField from '../../components/decor/AuthBubbleField'

export default function LoginScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)
    try {
      const result = await googleSignIn()
      if (!result) return
      await loginWithGoogle(result.idToken)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'center', paddingTop: spacing.xl, marginBottom: spacing.xl }}>
          <View style={{ position: 'relative', height: 44, width: 44 * (5000 / 2725), alignItems: 'center', justifyContent: 'center' }}>
            <AuthBubbleField />
            <BrandLogo height={44} />
          </View>
          <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12.5, letterSpacing: 0.2, marginTop: spacing.md, textAlign: 'center' }}>
            Where verified talent meets real work.
          </Text>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, marginTop: spacing.lg }}>Welcome back.</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            Sign in to check your applications and pick up where you left off.
          </Text>
        </View>

        <GoogleAuthButton onPress={handleGoogleLogin} loading={googleLoading} disabled={loading} />
        <OrDivider label="or sign in with email" />

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', minHeight: 32, justifyContent: 'center', marginBottom: spacing.sm }}>
          <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 13 }}>Forgot password?</Text>
        </Pressable>

        {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button title="Sign in →" onPress={handleLogin} loading={loading} disabled={!email || !password || googleLoading} style={{ marginTop: spacing.sm }} />

        <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: spacing.lg, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
            New here? <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>Create an account</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
