import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../theme'
import { getJobSuggestions } from '../../services/jobsService'
import HeroPattern from './HeroPattern'
import PressableScale from '../ui/PressableScale'

// Mirrors the website's mobile hero (Website/Landing-Frontend's
// JobSearchHero.jsx): centered headline with the accent second line, the two
// subtitle lines, and one search card with keyword, location and experience
// plus a gradient CTA. (The site's "hiring talent" toggle is left out — the
// app is for candidates only.)
// Searching hands the three values to the Search & Filters page, which shows
// the matching list (see HomeScreen.openSearch).
const HEADLINE_1 = 'Where\nVerified Talent'
const HEADLINE_2 = 'Meets Real Work.'
const SUBTITLE_1 = 'Get discovered, build your skills, and grow through real opportunities.'
const SUBTITLE_2 = 'One platform connecting candidates, employers, verification, feedback and growth.'
const POPULAR_SEARCHES = ['Software Developer', 'Sales Executive', 'HR Executive', 'Data Analyst', 'Fresher Jobs']

// `years` is the value the filter page's "my experience is N years" filter
// takes — a representative point inside each band.
const EXPERIENCE_OPTIONS = [
  { label: 'Any experience', years: null },
  { label: 'Fresher', years: 0 },
  { label: '1–3 years', years: 2 },
  { label: '3–5 years', years: 4 },
  { label: '5–10 years', years: 7 },
  { label: '10+ years', years: 10 },
]

const HERO_GRADIENT = ['#3b6df0', '#6c5cf0']
const HERO_ACCENT = '#5a62ee'
const SUGGEST_DEBOUNCE_MS = 300
const SUGGEST_LIMIT = 8

function countLabel(count) {
  if (!count) return null
  return `${count} job${count === 1 ? '' : 's'}`
}

// Live autocomplete dropdown for one hero field — same live-ranked
// suggestions endpoint the website's Autocomplete.jsx uses (see
// jobsService.getJobSuggestions), scaled down to a single-select field
// (tap a row to fill the input) rather than the website's multi-tag box —
// a better fit for a small mobile keyboard-constrained search bar.
function SuggestRow({ icon, type, value, onChangeValue, placeholder, accessibilityLabel, onSubmit, rowStyle, inputStyle, divider }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)
  const seqRef = useRef(0)

  function runFetch(q) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++seqRef.current
    setLoading(true)
    getJobSuggestions({ type, q, limit: SUGGEST_LIMIT }, { signal: controller.signal })
      .then((result) => {
        if (requestId !== seqRef.current) return
        setItems(result)
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
        if (requestId !== seqRef.current) return
        setItems([])
      })
      .finally(() => {
        if (requestId === seqRef.current) setLoading(false)
      })
  }

  function scheduleFetch(q) {
    clearTimeout(debounceRef.current)
    if (!q.trim()) {
      runFetch(q)
      return
    }
    debounceRef.current = setTimeout(() => runFetch(q), SUGGEST_DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [])

  function pick(item) {
    onChangeValue(item.value)
    setOpen(false)
  }

  return (
    <View>
      <View style={rowStyle}>
        <Feather name={icon} size={19} color={colors.inkSecondary} />
        <TextInput
          value={value}
          onChangeText={(v) => {
            onChangeValue(v)
            scheduleFetch(v)
          }}
          onFocus={() => {
            setOpen(true)
            scheduleFetch(value)
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          placeholderTextColor={colors.inkTertiary}
          returnKeyType="search"
          onSubmitEditing={() => {
            setOpen(false)
            onSubmit()
          }}
          style={inputStyle}
          accessibilityLabel={accessibilityLabel}
        />
        {loading ? <ActivityIndicator size="small" color={colors.inkTertiary} /> : null}
      </View>
      {divider}

      {open && (items.length > 0 || loading) ? (
        <View
          style={{
            position: 'absolute',
            left: spacing.md,
            right: spacing.md,
            top: '100%',
            zIndex: 20,
            elevation: 8,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: 240,
            paddingVertical: 4,
            shadowColor: '#101828',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {items.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => pick(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.sm,
                  paddingVertical: 10,
                  paddingHorizontal: spacing.md,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Feather name={item.isRemote ? 'globe' : icon} size={13} color={colors.inkTertiary} />
                  <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5, flexShrink: 1 }} numberOfLines={1}>
                    {item.value}
                  </Text>
                </View>
                {countLabel(item.count) ? (
                  <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 11.5 }}>{countLabel(item.count)}</Text>
                ) : null}
              </Pressable>
            ))}
            {!items.length && loading ? (
              <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12.5, padding: spacing.md }}>Loading…</Text>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  )
}

export default function JobSearchSection({ onOpenSearch }) {
  const { colors, radius, spacing, fontFamily, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState(EXPERIENCE_OPTIONS[0])
  const [experienceOpen, setExperienceOpen] = useState(false)

  const cardShadow = Platform.select({
    ios: { shadowColor: '#1e2a78', shadowOffset: { width: 0, height: 10 }, shadowOpacity: isDark ? 0 : 0.1, shadowRadius: 22 },
    android: { elevation: isDark ? 0 : 4 },
  })

  const rowStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  }
  const inputStyle = { flex: 1, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 15, paddingVertical: 12 }
  const divider = <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md }} />

  function search() {
    onOpenSearch({ query: query.trim(), location: location.trim(), experience: experience.years })
  }

  // Reserves room for HomeFloatingNav (see HomeScreen.js), which now floats
  // as a position:absolute overlay fixed over the scroll content — same as
  // the website's `position: fixed` navbar plus its hero's pt-28 — rather
  // than living inline in this scrollable content the way it briefly did.
  const content = (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + 90, paddingBottom: spacing.xl }}>
      <Text
        style={{
          color: colors.ink,
          fontFamily: fontFamily.bold,
          fontSize: 32,
          lineHeight: 37,
          letterSpacing: -0.6,
          textAlign: 'center',
        }}
      >
        {HEADLINE_1}
      </Text>
      <Text
        style={{
          color: isDark ? colors.teal : HERO_ACCENT,
          fontFamily: fontFamily.bold,
          fontSize: 32,
          lineHeight: 37,
          letterSpacing: -0.6,
          textAlign: 'center',
        }}
      >
        {HEADLINE_2}
      </Text>

      <Text
        style={{ color: colors.ink, opacity: 0.8, fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: spacing.md }}
      >
        {SUBTITLE_1}
      </Text>
      <Text
        style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: spacing.xs }}
      >
        {SUBTITLE_2}
      </Text>

      {/* Search card */}
      <View
        style={[
          {
            marginTop: spacing.lg,
            backgroundColor: colors.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: colors.border,
            paddingTop: spacing.xs,
            paddingBottom: spacing.md,
          },
          cardShadow,
        ]}
      >
        <SuggestRow
          icon="search"
          type="title"
          value={query}
          onChangeValue={setQuery}
          placeholder="Search jobs, skills or company"
          accessibilityLabel="Search jobs, skills or company"
          onSubmit={search}
          rowStyle={rowStyle}
          inputStyle={inputStyle}
          divider={divider}
        />
        <SuggestRow
          icon="map-pin"
          type="location"
          value={location}
          onChangeValue={setLocation}
          placeholder={'City, state or “Remote”'}
          accessibilityLabel="City, state or Remote"
          onSubmit={search}
          rowStyle={rowStyle}
          inputStyle={inputStyle}
          divider={divider}
        />
        <Pressable
          onPress={() => setExperienceOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={`Experience: ${experience.label}`}
          accessibilityState={{ expanded: experienceOpen }}
          style={rowStyle}
        >
          <Feather name="briefcase" size={19} color={colors.inkSecondary} />
          <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.regular, fontSize: 15, paddingVertical: 12 }}>{experience.label}</Text>
          <Feather name={experienceOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.inkSecondary} />
        </Pressable>

        {experienceOpen ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
            {EXPERIENCE_OPTIONS.map((option) => {
              const selected = option.label === experience.label
              return (
                <Pressable
                  key={option.label}
                  onPress={() => {
                    setExperience(option)
                    setExperienceOpen(false)
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected ? HERO_ACCENT : colors.border,
                    backgroundColor: selected ? colors.navyTint : colors.surface,
                  }}
                >
                  <Text style={{ color: selected ? HERO_ACCENT : colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{option.label}</Text>
                </Pressable>
              )
            })}
          </View>
        ) : null}

        <PressableScale
          onPress={search}
          accessibilityRole="button"
          accessibilityLabel="Search jobs"
          scaleTo={0.985}
          style={{ marginHorizontal: spacing.md, marginTop: spacing.sm }}
        >
          <LinearGradient
            colors={HERO_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 54, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: 16 }}>Search Jobs</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </LinearGradient>
        </PressableScale>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: 6 }}>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 13 }}>Popular:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {POPULAR_SEARCHES.map((term) => (
              <Pressable key={term} onPress={() => onOpenSearch({ query: term })} hitSlop={6}>
                <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  )

  const shell = { borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, overflow: 'hidden' }

  if (isDark) {
    return (
      <View style={[shell, { backgroundColor: colors.bgSecondary }]}>
        {content}
      </View>
    )
  }

  return (
    <LinearGradient colors={['#eef2fd', '#f4f2fb', '#fbf4ef']} style={shell}>
      <HeroPattern />
      {content}
    </LinearGradient>
  )
}
