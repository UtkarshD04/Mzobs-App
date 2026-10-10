import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useTheme } from '../../theme'
import PressableScale from '../ui/PressableScale'

// Mirrors the website's RecommendedForYou.jsx "match deck" — real
// matchReasons/matchScore from the same endpoint (Backend's
// employeeRecommendationsController.getRecommendedJobs), just a simpler
// tap-through Prev/Next deck instead of GSAP drag physics (the app is
// always signed-in, so there's no sample-preview/"sign in" branch to build —
// this is the equivalent of that component's signed-in state only).
// mz-primary, mz-secondary, mz-accent — same three-theme rotation as before,
// re-tinted to the current teal brand family.
const THEMES = [
  { bg: '#e7f5f1', border: 'rgba(11,122,109,0.22)', accent: '#0b7a6d', markInk: '#075f55' },
  { bg: '#e9f6f4', border: 'rgba(15,139,125,0.24)', accent: '#0f8b7d', markInk: '#0b6b60' },
  { bg: '#e4f8f1', border: 'rgba(11,138,103,0.24)', accent: '#0b8a67', markInk: '#086f52' },
]
const MATCH_LEVEL_LABEL = (n) => (n >= 3 ? 'Strong match' : n === 2 ? 'Good match' : 'Relevant match')
const pad = (n) => String(n).padStart(2, '0')

function initialsOf(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function DeckPeek({ theme, depth }) {
  const { radius } = useTheme()
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 10 + depth * 10,
        right: -10 - depth * 4,
        top: 8 + depth * 8,
        bottom: -8 - depth * 4,
        borderRadius: radius.lg,
        backgroundColor: theme.bg,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: 0.7 - depth * 0.15,
      }}
    />
  )
}

function DeckCard({ job, theme, index, total, onPress }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const reasons = job.matchReasons ?? []
  const skills = (job.skills ?? []).slice(0, 4)
  const meta = [job.company, job.location, job.employmentType ?? job.workMode].filter(Boolean).join(' · ')

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <View
        style={{
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.bg,
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, backgroundColor: theme.accent }} />
        <View style={{ padding: spacing.lg, paddingLeft: spacing.lg + 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.markInk, fontFamily: fontFamily.bold, fontSize: 20 }}>{initialsOf(job.company || job.title)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={{ color: '#667085', fontFamily: fontFamily.bold, fontSize: 10.5, letterSpacing: 1 }}>
                {pad(index + 1)} / {pad(total)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent }} />
                <Text style={{ color: '#111827', fontFamily: fontFamily.bold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                  {MATCH_LEVEL_LABEL(reasons.length)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ color: '#111827', fontFamily: fontFamily.bold, fontSize: 21, marginTop: spacing.md }} numberOfLines={2}>
            {job.title}
          </Text>
          {meta ? <Text style={{ color: '#667085', fontFamily: fontFamily.regular, fontSize: 13.5, marginTop: 3 }}>{meta}</Text> : null}
          {skills.length > 0 ? (
            <Text style={{ color: '#111827', fontFamily: fontFamily.semibold, fontSize: 14, marginTop: spacing.sm }}>{skills.join(' · ')}</Text>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.sm,
              marginTop: spacing.md,
              paddingTop: spacing.md,
              borderTopWidth: 1,
              borderTopColor: 'rgba(17,24,39,0.1)',
            }}
          >
            {reasons.length > 0 ? (
              <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10, minWidth: 0 }}>
                {reasons.map((reason) => (
                  <View key={reason} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Feather name="check" size={13} color={theme.accent} />
                    <Text style={{ color: '#111827', fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{reason}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View />
            )}
            <Pressable onPress={onPress} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#0b7a6d', fontFamily: fontFamily.bold, fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                View opportunity
              </Text>
              <Feather name="arrow-right" size={13} color="#0b7a6d" />
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

// Sits in place of the generic "Jobs based on your profile" row — same
// underlying data (useRecommendedJobsQuery), richer presentation with the
// match reasons the backend already computes but the plain card list threw
// away.
export default function MatchedForYouSection({ jobs = [], isLoading, isPremium = false, onPressJob, onSeeAll, onCompleteProfile }) {
  const { colors, radius, spacing, fontFamily } = useTheme()
  const [active, setActive] = useState(0)

  if (isLoading) return null

  const n = jobs.length
  const clampedActive = Math.min(active, Math.max(0, n - 1))
  const job = jobs[clampedActive]
  const theme = THEMES[clampedActive % THEMES.length]

  return (
    <View style={{ marginTop: 32, paddingHorizontal: spacing.lg }}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 27 }}>
        The right job{'\n'}
        is <Text style={{ color: '#0b7a6d' }}>closer than you think.</Text>
      </Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 19, marginTop: spacing.sm }}>
        {n === 0
          ? 'A recommendation only shows up here once we have something real to point at — add a few skills and a preferred role to your profile to get matched.'
          : 'Matched against your skills, preferred role and location — with a clear reason for every recommendation.'}
      </Text>

      {n === 0 ? (
        <PressableScale
          onPress={onCompleteProfile}
          scaleTo={0.98}
          accessibilityRole="button"
          style={{
            marginTop: spacing.lg,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: THEMES[0].border,
            backgroundColor: THEMES[0].bg,
            padding: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <Feather name="user-plus" size={20} color={THEMES[0].accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 14 }}>Complete your profile</Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, marginTop: 1 }}>
              Skills, preferred role and location power every match.
            </Text>
          </View>
          <Feather name="arrow-right" size={16} color={THEMES[0].accent} />
        </PressableScale>
      ) : (
        <>
          <View style={{ marginTop: spacing.lg, paddingTop: 22 }}>
            {n > 2 ? <DeckPeek theme={THEMES[(clampedActive + 2) % THEMES.length]} depth={2} /> : null}
            {n > 1 ? <DeckPeek theme={THEMES[(clampedActive + 1) % THEMES.length]} depth={1} /> : null}
            <DeckCard job={job} theme={theme} index={clampedActive} total={n} onPress={() => onPressJob?.(job)} />
          </View>

          {n > 1 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
              <Pressable
                onPress={() => setActive((i) => (i - 1 + n) % n)}
                hitSlop={8}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Feather name="arrow-left" size={13} color={colors.ink} />
                <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase' }}>Previous</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.accent }} />
                <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 11.5 }}>
                  {pad(clampedActive + 1)} <Text style={{ color: colors.inkTertiary }}>/ {pad(n)}</Text>
                </Text>
              </View>
              <Pressable
                onPress={() => setActive((i) => (i + 1) % n)}
                hitSlop={8}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase' }}>Next</Text>
                <Feather name="arrow-right" size={13} color={colors.ink} />
              </Pressable>
            </View>
          ) : null}

          <View style={{ marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 11, letterSpacing: 0.6 }}>
              <Text style={{ color: '#0b7a6d' }}>01</Text> / MATCHED FOR YOU
            </Text>
            <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 4 }}>
              {n} {n === 1 ? 'opportunity' : 'opportunities'} selected from your profile.
            </Text>
            {isPremium ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Feather name="star" size={12} color="#0b7a6d" />
                <Text style={{ color: '#0b7a6d', fontFamily: fontFamily.semibold, fontSize: 12.5 }}>Premium: matched from a wider pool, with more picks</Text>
              </View>
            ) : null}
            {onSeeAll ? (
              <Pressable onPress={onSeeAll} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm }}>
                <Text style={{ color: '#0b7a6d', fontFamily: fontFamily.bold, fontSize: 13 }}>View all matches</Text>
                <Feather name="arrow-right" size={13} color="#0b7a6d" />
              </Pressable>
            ) : null}
          </View>
        </>
      )}

      {/* Magazine-style closing statement — mirrors the website's SignInCta,
          but the app has no signed-out state to bridge: it's already a
          "browse more matches" CTA rather than a sign-in prompt. */}
      {onSeeAll ? (
        <View style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: fontFamily.bold,
              fontSize: 26,
              lineHeight: 28,
              letterSpacing: -0.3,
              textTransform: 'uppercase',
            }}
          >
            The right job{'\n'}
            <Text style={{ color: '#0b7a6d' }}>should find you too.</Text>
          </Text>
          <Pressable
            onPress={onSeeAll}
            accessibilityRole="button"
            style={{
              marginTop: spacing.lg,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 20,
              minHeight: 50,
              borderRadius: 999,
              backgroundColor: '#5b5fef',
            }}
          >
            <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: 14 }}>
              {n > 0 ? 'See more jobs matched to your profile' : 'Browse all jobs'}
            </Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}
