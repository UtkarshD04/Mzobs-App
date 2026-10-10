import { View, Text, Pressable } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { fmtSalaryRange, fmtExperience } from '../../lib/format'
import { useIsJobSaved, toggleJobSaved } from '../../lib/savedJobs'
import Avatar from '../ui/Avatar'
import PressableScale from '../ui/PressableScale'

const MAX_VISIBLE_SKILLS = 2

// Mirrors the website's JobListItem.jsx: left-edge accent bar, teal company
// line, icon meta row, tone-rotated skill badges and a "View role" link.
// SKILL_TONES / accent literals are that component's own.
const TEAL = '#078B7D'
const NAVY = '#123B5D'
const SKILL_TONES = [
  { bg: '#E8F7F4', text: '#078B7D' },
  { bg: '#EEF5FA', text: '#12304A' },
  { bg: '#F0EDFF', text: '#5B4FD6' },
]

export default function JobOpeningCard({ job, applied, index = 0, onPress, distanceKm = null }) {
  const { colors, spacing, fontFamily, isDark } = useTheme()
  const salary = fmtSalaryRange(job, '')
  const skills = (job.skills ?? []).filter(Boolean).slice(0, MAX_VISIBLE_SKILLS)
  const location = distanceKm != null ? `${job.location} · ${Math.round(distanceKm)} km away` : job.location?.split(',')[0]
  const meta = [
    { icon: 'map-pin', text: location, color: isDark ? colors.teal : TEAL },
    { icon: 'briefcase', text: fmtExperience(job), color: isDark ? colors.teal : '#0b7a6d' },
    { icon: 'monitor', text: job.workMode, color: colors.inkTertiary },
  ].filter((m) => m.text)
  const accent = index === 0 || index % 2 === 0 ? (isDark ? colors.teal : TEAL) : isDark ? colors.border : '#EEF5FA'
  const teal = isDark ? colors.teal : TEAL
  const title = isDark ? colors.ink : NAVY

  const saved = useIsJobSaved(job)

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30).duration(160)}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}
      >
        <View
          style={{
            marginBottom: spacing.md,
            overflow: 'hidden',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: isDark ? colors.surface : '#ffffff',
            paddingVertical: 16,
            paddingRight: 16,
            paddingLeft: 20,
          }}
        >
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, backgroundColor: accent }} />

          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Avatar name={job.company} size={44} style={{ borderRadius: 10 }} />

            <View style={{ flex: 1 }}>
              <Text style={{ color: title, fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 21, paddingRight: 32 }} numberOfLines={2}>
                {job.title}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                <Text style={{ color: teal, fontFamily: fontFamily.regular, fontSize: 13.5, flexShrink: 1 }} numberOfLines={1}>
                  {job.company}
                </Text>
                {job.verified ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: isDark ? colors.navyTint : '#E8F7F4' }}>
                    <Feather name="check-circle" size={11} color={teal} />
                    <Text style={{ color: teal, fontFamily: fontFamily.semibold, fontSize: 11 }}>Verified</Text>
                  </View>
                ) : null}
                {job.instantHiring ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: isDark ? colors.amberTint : '#fef3c7' }}>
                    <Feather name="zap" size={11} color={isDark ? colors.amber : '#92400e'} />
                    <Text style={{ color: isDark ? colors.amber : '#92400e', fontFamily: fontFamily.semibold, fontSize: 11 }}>Urgent</Text>
                  </View>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 4, marginTop: 10 }}>
                {meta.map(({ icon, text, color }) => (
                  <View key={icon} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name={icon} size={13.5} color={color} />
                    <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13 }}>{text}</Text>
                  </View>
                ))}
                {salary ? <Text style={{ color: title, fontFamily: fontFamily.bold, fontSize: 13 }}>{salary}</Text> : null}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, flexShrink: 1 }}>
                  {skills.map((skill, i) => {
                    const tone = SKILL_TONES[i % SKILL_TONES.length]
                    return (
                      <View key={skill} style={{ borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: isDark ? colors.navyTint : tone.bg }}>
                        <Text style={{ color: isDark ? colors.teal : tone.text, fontFamily: fontFamily.medium, fontSize: 12 }}>{skill}</Text>
                      </View>
                    )
                  })}
                  {job.posted ? (
                    <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>
                      {skills.length > 0 ? '· ' : ''}
                      {job.posted}
                    </Text>
                  ) : null}
                </View>
                {applied ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel="Applied">
                    <Feather name="check-circle" size={13} color={colors.green} />
                    <Text style={{ color: colors.green, fontFamily: fontFamily.semibold, fontSize: 13 }}>Applied</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: teal, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>View role</Text>
                    <Feather name="arrow-right" size={14} color={teal} />
                  </View>
                )}
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => toggleJobSaved(job)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 36,
              height: 36,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: saved ? (isDark ? colors.navyTint : '#E8F7F4') : 'transparent',
            }}
          >
            <Feather name="bookmark" size={17} color={saved ? teal : colors.inkTertiary} />
          </Pressable>
        </View>
      </PressableScale>
    </Animated.View>
  )
}
