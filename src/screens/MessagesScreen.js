import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useThreadsQuery, useThreadMessagesQuery, useSendMessageMutation } from '../hooks/useMessages'
import ScreenContainer from '../components/ui/ScreenContainer'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function Bubble({ message }) {
  const { colors, fontFamily, radius } = useTheme()
  const mine = message.direction === 'out'
  return (
    <View
      style={{
        maxWidth: '78%',
        alignSelf: mine ? 'flex-end' : 'flex-start',
        backgroundColor: mine ? colors.navy : colors.surfaceSunken,
        borderRadius: radius.lg,
        borderBottomRightRadius: mine ? 4 : radius.lg,
        borderBottomLeftRadius: mine ? radius.lg : 4,
        paddingVertical: 9,
        paddingHorizontal: 13,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: mine ? '#ffffff' : colors.ink, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 19 }}>{message.text}</Text>
      <Text style={{ color: mine ? 'rgba(255,255,255,0.65)' : colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 10.5, marginTop: 4 }}>
        {new Date(message.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  )
}

export default function MessagesScreen({ route }) {
  const { colors, spacing, fontFamily } = useTheme()
  const { data: threads = [], isLoading: threadsLoading } = useThreadsQuery()
  const activeId = threads[0]?.id
  const { data: messages = [], isLoading: messagesLoading } = useThreadMessagesQuery(activeId)
  const sendMessage = useSendMessageMutation(activeId)
  const [draft, setDraft] = useState(route.params?.prefillDraft ?? '')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (route.params?.prefillDraft) setDraft(route.params.prefillDraft)
  }, [route.params?.prefillDraft])

  useEffect(() => {
    if (messages.length) scrollRef.current?.scrollToEnd({ animated: false })
  }, [messages.length])

  if (threadsLoading || (activeId && messagesLoading)) return <LoadingSpinner />

  function handleSend() {
    const text = draft.trim()
    if (!text || !activeId) return
    setDraft('')
    sendMessage.mutate(text)
  }

  const active = threads[0]

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {threads.length === 0 ? (
        <ScreenContainer>
          <EmptyState icon="message-square" title="No conversations yet" message="Messages from the Mzobs team will show up here." />
        </ScreenContainer>
      ) : (
        <>
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 15 }}>{active.name}</Text>
            <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>{active.role}</Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: spacing.lg, flexGrow: 1, justifyContent: 'flex-end' }}
          >
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
          </ScrollView>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message…"
              placeholderTextColor={colors.inkTertiary}
              style={{
                flex: 1,
                height: 40,
                paddingHorizontal: spacing.md,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                backgroundColor: colors.surface,
                color: colors.ink,
                fontFamily: fontFamily.regular,
                fontSize: 13.5,
              }}
            />
            <Pressable
              onPress={handleSend}
              disabled={sendMessage.isPending || !draft.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.navyTint,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !draft.trim() ? 0.5 : 1,
              }}
            >
              <Feather name="send" size={17} color={colors.navy} />
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  )
}
