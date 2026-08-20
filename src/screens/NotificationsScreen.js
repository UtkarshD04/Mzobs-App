import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../theme'
import { useNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../hooks/useNotifications'
import { CATEGORY_META } from '../lib/notificationMeta'
import ScreenContainer from '../components/ui/ScreenContainer'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const TABS = ['All', 'Unread', 'Applications', 'Resume', 'Interviews', 'Training']
const TAB_CATS = [null, null, 'applications', 'resume', 'interviews', 'training']

function Pill({ label, active, onPress }) {
  const { colors, fontFamily } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: 999,
        backgroundColor: active ? colors.navy : colors.surfaceSunken,
        marginRight: 8,
      }}
    >
      <Text style={{ color: active ? '#ffffff' : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  )
}

function NotifRow({ n, onOpen, isLast }) {
  const { colors, spacing, fontFamily, radius } = useTheme()
  const meta = CATEGORY_META[n.category] ?? CATEGORY_META.system
  const tintKey = `${meta.tone}Tint`
  const iconColorKey = meta.tone === 'gold' ? 'goldStrong' : meta.tone

  return (
    <Pressable onPress={() => n.unread && onOpen(n.id)}>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.md,
          padding: spacing.lg,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.border,
          backgroundColor: n.unread ? colors.navyTint : 'transparent',
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.md,
            backgroundColor: colors[tintKey],
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Feather name={meta.icon} size={16} color={colors[iconColorKey]} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>{n.title}</Text>
            {n.unread ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.goldDot, marginTop: 4 }} /> : null}
          </View>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12, marginTop: 4 }}>{n.body}</Text>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 11, marginTop: 4 }}>{n.time}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export default function NotificationsScreen() {
  const { colors, spacing, fontFamily } = useTheme()
  const [tab, setTab] = useState(0)
  const { data: notifications = [], isLoading, refetch, isRefetching } = useNotificationsQuery()
  const markRead = useMarkNotificationReadMutation()
  const markAllRead = useMarkAllNotificationsReadMutation()

  if (isLoading) return <LoadingSpinner />

  const cat = TAB_CATS[tab]
  const list = tab === 1 ? notifications.filter((n) => n.unread) : cat ? notifications.filter((n) => n.category === cat) : notifications

  return (
    <ScreenContainer onRefresh={refetch} refreshing={isRefetching}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>Notifications</Text>
          <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 4 }}>Stay updated on your journey.</Text>
        </View>
      </View>

      <Button
        title="Mark all read"
        variant="secondary"
        onPress={() => markAllRead.mutate()}
        loading={markAllRead.isPending}
        style={{ marginTop: spacing.md, alignSelf: 'flex-start', paddingHorizontal: spacing.lg }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg }} contentContainerStyle={{ paddingRight: spacing.lg }}>
        {TABS.map((label, i) => (
          <Pill key={label} label={label} active={tab === i} onPress={() => setTab(i)} />
        ))}
      </ScrollView>

      <View style={{ marginTop: spacing.lg }}>
        {list.length === 0 ? (
          <Card>
            <EmptyState icon="bell" title="You're all caught up" message="Nothing new to see here." />
          </Card>
        ) : (
          <Card style={{ padding: 0 }}>
            {list.map((n, i) => (
              <NotifRow key={n.id} n={n} onOpen={markRead.mutate} isLast={i === list.length - 1} />
            ))}
          </Card>
        )}
      </View>
    </ScreenContainer>
  )
}
