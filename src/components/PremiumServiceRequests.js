import { useState } from 'react'
import { View, Text, Modal, Pressable, Linking, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useRequestServiceMutation, useCancelServiceRequestMutation } from '../hooks/usePremiumServices'
import Button from './ui/Button'
import Badge from './ui/Badge'
import TextField from './ui/TextField'

export const OPEN_STATUSES = ['requested', 'scheduled', 'in_progress']

const STATUS_META = {
  requested: { label: 'Requested', tone: 'gold' },
  scheduled: { label: 'Scheduled', tone: 'navy' },
  in_progress: { label: 'In progress', tone: 'navy' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'gray' },
}

const fmtDateTime = (value) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

// Bottom-sheet style form: the candidate adds an optional note and preferred time.
export function RequestServiceModal({ service, onClose }) {
  const { colors, spacing, fontFamily, radius } = useTheme()
  const request = useRequestServiceMutation()
  const [note, setNote] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [error, setError] = useState('')

  if (!service) return null

  async function submit() {
    setError('')
    try {
      await request.mutateAsync({ service: service.key, note: note.trim(), preferredTime: preferredTime.trim() })
      setNote('')
      setPreferredTime('')
      onClose(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => onClose(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <Pressable style={{ flex: 1 }} onPress={() => onClose(false)} accessibilityLabel="Close" />
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, maxHeight: '85%' }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 18 }}>{service.label}</Text>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20, marginTop: 4, marginBottom: spacing.md }}>{service.description}</Text>
            <TextField label="What would you like help with? (optional)" value={note} onChangeText={setNote} multiline maxLength={1000} placeholder="Target role, company, anything the team should know" inputStyle={{ minHeight: 80, textAlignVertical: 'top' }} />
            <TextField label="Preferred time (optional)" value={preferredTime} onChangeText={setPreferredTime} maxLength={200} placeholder="e.g. Weekdays after 6 pm" />
            {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 13, marginBottom: spacing.sm }}>{error}</Text> : null}
            <Button title={request.isPending ? 'Sending…' : 'Send request'} loading={request.isPending} onPress={submit} />
            <Button title="Cancel" variant="secondary" onPress={() => onClose(false)} style={{ marginTop: 8 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function LinkRow({ icon, label, url }) {
  const { colors, fontFamily } = useTheme()
  return (
    <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
      <Feather name={icon} size={14} color={colors.navy} />
      <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>{label}</Text>
    </Pressable>
  )
}

// One of the candidate's requests: stage, schedule, meeting/deliverable links,
// the team's message, and cancel while it's still only "requested".
export function ServiceRequestCard({ request, serviceLabel }) {
  const { colors, fontFamily } = useTheme()
  const cancel = useCancelServiceRequestMutation()
  const [error, setError] = useState('')
  const meta = STATUS_META[request.status] ?? STATUS_META.requested

  async function onCancel() {
    setError('')
    try {
      await cancel.mutateAsync(request.id)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not cancel. Please try again.')
    }
  }

  return (
    <View style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 14.5 }}>{serviceLabel}</Text>
        <Badge label={meta.label} tone={meta.tone} />
      </View>
      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 4 }}>
        {request.status === 'delivered' && request.deliveredOn ? `Delivered ${fmtDateTime(request.deliveredOn)}` : `Requested ${fmtDateTime(request.createdAt)}`}
      </Text>
      {request.scheduledFor && OPEN_STATUSES.includes(request.status) ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <Feather name="calendar" size={14} color={colors.ink} />
          <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13.5 }}>{fmtDateTime(request.scheduledFor)}</Text>
        </View>
      ) : null}
      {request.assignedTo && request.status !== 'cancelled' ? (
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 6 }}>Handled by {request.assignedTo}</Text>
      ) : null}
      {request.candidateMessage ? (
        <Text style={{ color: colors.ink, fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, marginTop: 8 }}>{request.candidateMessage}</Text>
      ) : null}
      {request.meetingLink && OPEN_STATUSES.includes(request.status) ? <LinkRow icon="video" label="Join meeting" url={request.meetingLink} /> : null}
      {request.deliverableLink ? <LinkRow icon="download" label="Open your deliverable" url={request.deliverableLink} /> : null}
      {request.status === 'requested' ? (
        <Button title={cancel.isPending ? 'Cancelling…' : 'Cancel request'} variant="secondary" loading={cancel.isPending} onPress={onCancel} style={{ marginTop: 12 }} />
      ) : null}
      {error ? <Text style={{ color: colors.red, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 6 }}>{error}</Text> : null}
    </View>
  )
}
