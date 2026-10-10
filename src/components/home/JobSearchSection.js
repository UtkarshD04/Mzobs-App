import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../theme'
import BrandLogo from '../ui/BrandLogo'
import ProgressRing from '../ui/ProgressRing'

// Compact app-style top of Home: a header row (menu, logo, notifications,
// profile with a completion ring), one big rounded search pill and the quick
// chips (passed as children) — all on a soft teal wash with rounded bottom
// corners. Location and experience live on the Search & Filters page that a
// search opens (see HomeScreen.openSearch).
const WASH = ['#dff3ee', '#eef8f6', '#f7f9fc']

function initialsOf(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function JobSearchSection({ onOpenSearch, onFilters, onMenu, onBell, onProfile, unreadCount = 0, profileName, profilePercent = 0, children }) {
  const { colors, fontFamily, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const ringColor = profilePercent >= 80 ? colors.green : profilePercent >= 50 ? colors.gold : colors.navy

  function search() {
    onOpenSearch({ query: query.trim() })
  }

  const iconBtn = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }

  const content = (
    <View style={{ paddingTop: insets.top + 8, paddingBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }}>
        <Pressable onPress={onMenu} hitSlop={6} accessibilityRole="button" accessibilityLabel="Open menu" style={iconBtn}>
          <Feather name="menu" size={24} color={colors.ink} />
        </Pressable>
        <BrandLogo height={46} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={onBell} hitSlop={6} accessibilityRole="button" accessibilityLabel="Notifications" style={iconBtn}>
            <Feather name="bell" size={22} color={colors.ink} />
            {unreadCount > 0 ? (
              <View style={{ position: 'absolute', top: 8, right: 8, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: 9.5, includeFontPadding: false }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable onPress={onProfile} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Profile, ${profilePercent}% complete`} style={iconBtn}>
            <ProgressRing percent={profilePercent} color={ringColor} track={isDark ? colors.surfaceSunken : '#cfe6e1'} size={38} thickness={3}>
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navyTint }}>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 11 }}>{initialsOf(profileName)}</Text>
              </View>
            </ProgressRing>
          </Pressable>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginHorizontal: 16,
          marginTop: 14,
          height: 54,
          paddingHorizontal: 18,
          borderRadius: 999,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#075f55',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0 : 0.1,
          shadowRadius: 14,
          elevation: isDark ? 0 : 3,
        }}
      >
        <Feather name="search" size={20} color={colors.ink} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for 'Data Analyst'"
          placeholderTextColor={colors.inkTertiary}
          returnKeyType="search"
          onSubmitEditing={search}
          accessibilityLabel="Search jobs by title, skills or company"
          style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 15.5, paddingVertical: 0 }}
        />
        {query ? (
          <Pressable onPress={search} hitSlop={8} accessibilityRole="button" accessibilityLabel="Search">
            <Feather name="arrow-right-circle" size={24} color={colors.navy} />
          </Pressable>
        ) : null}
        <View style={{ width: 1, height: 24, backgroundColor: colors.border }} />
        <Pressable onPress={() => onFilters?.(query.trim())} hitSlop={8} accessibilityRole="button" accessibilityLabel="Filters" style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Feather name="sliders" size={19} color={colors.navy} />
          <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 14 }}>Filters</Text>
        </Pressable>
      </View>

      {children ? <View style={{ marginTop: 14 }}>{children}</View> : null}
    </View>
  )

  const shell = { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' }

  if (isDark) return <View style={[shell, { backgroundColor: colors.bgSecondary }]}>{content}</View>
  return (
    <LinearGradient colors={WASH} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={shell}>
      {content}
    </LinearGradient>
  )
}
