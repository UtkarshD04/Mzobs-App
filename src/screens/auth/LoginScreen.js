import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import ScreenContainer from '../../components/ui/ScreenContainer'
import BrandLogo from '../../components/ui/BrandLogo'
import AuthBubbleField from '../../components/decor/AuthBubbleField'

export default function LoginScreen({ navigation }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'center', paddingTop: spacing.xl, marginBottom: spacing.xl }}>
          <View
            style={{
              position: 'relative',
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: colors.navyTint,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <AuthBubbleField />
            <Feather name="briefcase" size={28} color={colors.navy} />
          </View>
          <BrandLogo height={24} />
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, marginTop: spacing.lg }}>Welcome back.</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            Sign in to check your applications and pick up where you left off.
          </Text>
        </View>

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

        <Button title="Sign in →" onPress={handleLogin} loading={loading} disabled={!email || !password} style={{ marginTop: spacing.sm }} />

        <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: spacing.lg, alignItems: 'center', minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
            New here? <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>Create an account</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
