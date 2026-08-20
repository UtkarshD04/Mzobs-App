import { useState } from 'react'
import { View, Text, Linking, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useProfileQuery } from '../hooks/useProfile'
import * as contactService from '../services/contactService'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import TextField from '../components/ui/TextField'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function SupportScreen({ route }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: profile, isLoading } = useProfileQuery()
  const [subject, setSubject] = useState(route.params?.prefillSubject ?? '')
  const [message, setMessage] = useState(route.params?.prefillMessage ?? '')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  if (isLoading) return <LoadingSpinner />

  async function handleSubmit() {
    setError('')
    setStatus('sending')
    try {
      await contactService.submitContactMessage({
        name: profile.name,
        email: profile.email,
        role: 'Job Seeker',
        subject,
        message,
      })
      setStatus('sent')
      setSubject('')
      setMessage('')
    } catch (err) {
      setStatus('idle')
      setError(err.response?.data?.message ?? 'Could not send your message. Please try again.')
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Support</Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4, marginBottom: spacing.lg }}>
          We usually respond within a few hours.
        </Text>

        <Card>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>Send us a message</Text>

          {status === 'sent' ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <Feather name="check-circle" size={28} color={colors.green} />
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginTop: spacing.sm }}>Message sent</Text>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4, textAlign: 'center' }}>
                The Mzobs team will get back to you by email shortly.
              </Text>
              <Button title="Send another message" variant="secondary" onPress={() => setStatus('idle')} style={{ marginTop: spacing.lg }} />
            </View>
          ) : (
            <>
              <TextField label="Subject" value={subject} onChangeText={setSubject} placeholder="What's this about?" />
              <TextField
                label="Message"
                value={message}
                onChangeText={setMessage}
                placeholder="Tell us more..."
                multiline
                numberOfLines={5}
              />
              {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginBottom: spacing.md }}>{error}</Text> : null}
              <Button
                title="Send message"
                onPress={handleSubmit}
                loading={status === 'sending'}
                disabled={!subject.trim() || !message.trim()}
              />
            </>
          )}
        </Card>

        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Other ways to reach us
        </Text>
        <Pressable onPress={() => Linking.openURL('mailto:support@mzobs.com')}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Feather name="mail" size={18} color={colors.navy} />
            <View>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>Email us</Text>
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>support@mzobs.com</Text>
            </View>
          </Card>
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}
