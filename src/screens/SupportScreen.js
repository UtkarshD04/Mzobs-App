import { useState } from 'react'
import { View, Text, Linking, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useSupportTicketsQuery, useSubmitTicketMutation } from '../hooks/useSupport'
import { fmtDate } from '../lib/format'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import TextField from '../components/ui/TextField'
import SelectField from '../components/ui/SelectField'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Mirrors Website/Frontend's CustomerSupport.jsx — a ticket form plus a
// "Your Queries" history, not just a one-way contact form.
const CATEGORIES = ['General', 'Resume Verification', 'Application Status', 'Payment', 'Technical Issue']
const STATUS_TONE = { Open: 'navy', 'In Progress': 'gold', Resolved: 'green' }

export default function SupportScreen({ route }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: tickets = [], isLoading, refetch, isRefetching } = useSupportTicketsQuery()
  const submitMutation = useSubmitTicketMutation()
  const [subject, setSubject] = useState(route.params?.prefillSubject ?? '')
  const [category, setCategory] = useState('General')
  const [message, setMessage] = useState(route.params?.prefillMessage ?? '')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) return <LoadingSpinner />

  async function handleSubmit() {
    setError('')
    try {
      await submitMutation.mutateAsync({ subject, category, message })
      setSent(true)
      setSubject('')
      setCategory('General')
      setMessage('')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not send your message. Please try again.')
    }
  }

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Support</Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 4, marginBottom: spacing.lg }}>
          Raise a query and the Mzobs team will get back to you here.
        </Text>

        <Card>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginBottom: spacing.md }}>Raise a query</Text>

          {sent ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
              <Feather name="check-circle" size={28} color={colors.green} />
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14, marginTop: spacing.sm }}>Query submitted</Text>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4, textAlign: 'center' }}>
                Track its status below — the Mzobs team will reply here.
              </Text>
              <Button title="Raise another query" variant="secondary" onPress={() => setSent(false)} style={{ marginTop: spacing.lg }} />
            </View>
          ) : (
            <>
              <TextField label="Subject" value={subject} onChangeText={setSubject} placeholder="What's this about?" />
              <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
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
                title="Submit query"
                onPress={handleSubmit}
                loading={submitMutation.isPending}
                disabled={!subject.trim() || !message.trim()}
              />
            </>
          )}
        </Card>

        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.sm }}>
          Your queries
        </Text>
        {tickets.length === 0 ? (
          <Card>
            <EmptyState icon="life-buoy" title="No queries yet" message="Anything you raise above will show up here with its status." />
          </Card>
        ) : (
          tickets.map((t) => (
            <Card key={t.id} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14 }}>{t.subject}</Text>
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11.5, marginTop: 2 }}>
                    {t.category} · {fmtDate(t.createdAt)}
                  </Text>
                </View>
                <Badge label={t.status} tone={STATUS_TONE[t.status] ?? 'navy'} />
              </View>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: spacing.sm }}>{t.message}</Text>
              {t.reply ? (
                <View style={{ marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 11.5 }}>Mzobs replied</Text>
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 2 }}>{t.reply}</Text>
                </View>
              ) : null}
            </Card>
          ))
        )}

        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15, marginTop: spacing.md, marginBottom: spacing.sm }}>
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
