import { View, Text, Pressable, Platform } from 'react-native'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, useReducedMotion, withTiming } from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { fmtSalaryRange, fmtExperience } from '../../lib/format'
import { useIsJobSaved, toggleJobSaved } from '../../lib/savedJobs'
import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import Tag from '../ui/Tag'
import Badge from '../ui/Badge'

const MAX_VISIBLE_SKILLS = 2

// Neutral, recruiter-grade job card — one flat white treatment used
// everywhere (Home, search results, saved jobs, applications), no per-card
// tint. Text colours below are fixed hex, not theme tokens, since this is a
// deliberately narrower palette than the rest of the app.
export default function JobOpeningCard({ job, applied, index = 0, onPress, distanceKm = null }) {
  const { colors, spacing, fontFamily } = useTheme()
  const salary = fmtSalaryRange(job)
  const skills = job.skills ?? []
  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS)
  const extraSkillCount = Math.max(0, skills.length - MAX_VISIBLE_SKILLS)
  const metaLine = [fmtExperience(job), distanceKm != null ? `${job.location} · ${Math.round(distanceKm)} km away` : job.location, job.workMode]
    .filter(Boolean)
    .join('  ·  ')

  const saved = useIsJobSaved(job)

  function handleToggleSaved() {
    toggleJobSaved(job)
  }

  const reduceMotion = useReducedMotion()
  const press = useSharedValue(1)
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }))

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 30).duration(160)} style={pressStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          press.value = withTiming(reduceMotion ? 1 : 0.99, { duration: 80 })
        }}
        onPressOut={() => {
          press.value = withTiming(1, { duration: 100 })
        }}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}
      >
        <Card
          style={[
            { marginBottom: spacing.md, padding: spacing.md, borderRadius: 10, borderColor: colors.border },
            Platform.select({
              ios: { shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
              android: { elevation: 1 },
            }),
          ]}
        >
          <View style={{ flexDirection: 'row' }}>
            <Avatar name={job.company} size={44} tone="gray" style={{ borderRadius: 8, marginRight: spacing.md }} />

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                <Text style={{ flex: 1, color: '#111827', fontFamily: fontFamily.semibold, fontSize: 16 }} numberOfLines={2}>
                  {job.title}
                </Text>
                <Pressable
                  onPress={handleToggleSaved}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
                  style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginTop: -2 }}
                >
                  <Feather name="bookmark" size={17} color={saved ? colors.navy : colors.inkTertiary} />
                </Pressable>
              </View>

              <Text style={{ color: '#4B5563', fontFamily: fontFamily.medium, fontSize: 14, marginTop: 2 }} numberOfLines={1}>
                {job.company}
              </Text>

              {job.instantHiring ? <Badge label="Urgent hiring" tone="gold" style={{ alignSelf: 'flex-start', marginTop: 5 }} /> : null}

              {metaLine ? (
                <Text style={{ color: '#6B7280', fontFamily: fontFamily.regular, fontSize: 13, marginTop: spacing.xs }} numberOfLines={1}>
                  {metaLine}
                </Text>
              ) : null}

              {salary ? (
                <Text style={{ color: '#123B5D', fontFamily: fontFamily.semibold, fontSize: 14, marginTop: 4 }}>{salary}</Text>
              ) : null}

              {job.description ? (
                <Text style={{ color: '#6B7280', fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, marginTop: spacing.sm }} numberOfLines={2}>
                  {job.description}
                </Text>
              ) : null}

              {visibleSkills.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
                  {visibleSkills.map((skill) => (
                    <Tag key={skill} label={skill} />
                  ))}
                  {extraSkillCount > 0 ? <Tag label={`+${extraSkillCount} more`} /> : null}
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: spacing.md,
                  paddingTop: spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text style={{ color: '#9CA3AF', fontFamily: fontFamily.regular, fontSize: 12 }}>
                  {job.posted ? `Posted ${job.posted}` : ''}
                  {job.vacancies ? `  ·  ${job.vacancies} opening${job.vacancies > 1 ? 's' : ''}` : ''}
                </Text>
                {applied ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel="Applied">
                    <Feather name="check-circle" size={13} color={colors.green} />
                    <Text style={{ color: colors.green, fontFamily: fontFamily.semibold, fontSize: 12 }}>Applied</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 12 }}>View details</Text>
                    <Feather name="chevron-right" size={14} color={colors.navy} />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  )
}
