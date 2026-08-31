import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import ScreenContainer from '../../components/ui/ScreenContainer'
import BrandLogo from '../../components/ui/BrandLogo'

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
        <View style={{ height: 180, marginTop: -spacing.lg, marginHorizontal: -spacing.lg, overflow: 'hidden' }}>
          <View
            style={{
              position: 'absolute',
              top: -60,
              right: -50,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: colors.navyTint,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 30,
              left: -40,
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: colors.goldTint,
            }}
          />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.lg }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Feather name="briefcase" size={26} color={colors.navy} />
            </View>
            <BrandLogo height={26} />
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 19 }}>Welcome back</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4 }}>
            Sign in to continue your placement journey
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

        {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button title="Sign In" onPress={handleLogin} loading={loading} disabled={!email || !password} />

        <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
            New here? <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>Create an account</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
