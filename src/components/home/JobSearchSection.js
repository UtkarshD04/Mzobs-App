import { useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../theme'
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

export default function JobSearchSection({ onOpenSearch }) {
  const { colors, radius, spacing, fontFamily, isDark } = useTheme()
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
  const divider = { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md }

  function search() {
    onOpenSearch({ query: query.trim(), location: location.trim(), experience: experience.years })
  }

  const content = (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl }}>
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
        <View style={rowStyle}>
          <Feather name="search" size={19} color={colors.inkSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search jobs, skills or company"
            placeholderTextColor={colors.inkTertiary}
            returnKeyType="search"
            onSubmitEditing={search}
            style={inputStyle}
            accessibilityLabel="Search jobs, skills or company"
          />
        </View>
        <View style={divider} />
        <View style={rowStyle}>
          <Feather name="map-pin" size={19} color={colors.inkSecondary} />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={'City, state or “Remote”'}
            placeholderTextColor={colors.inkTertiary}
            returnKeyType="search"
            onSubmitEditing={search}
            style={inputStyle}
            accessibilityLabel="City, state or Remote"
          />
        </View>
        <View style={divider} />
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
