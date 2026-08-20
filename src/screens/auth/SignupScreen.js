import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { useTheme } from '../../theme'
import { useAuth } from '../../context/AuthContext'
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

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const canSubmit =
    form.name && form.email && form.phone.length === 10 && form.password.length >= 8 && form.graduation && experience

  async function handleSignup() {
    setError('')
    setLoading(true)
    try {
      await signup({ ...form, experience })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
          <BrandLogo height={32} />
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 22, marginTop: spacing.lg }}>Create your account</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 14.5, marginTop: 6 }}>
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
        />
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
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
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

        <Button title="Create Account" onPress={handleSignup} loading={loading} disabled={!canSubmit} />

        <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5 }}>
            Already have an account? <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold }}>Sign in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
