import { View, Text, Pressable, Platform } from 'react-native'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, useReducedMotion, withSpring } from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { fmtSalaryRange, fmtExperience } from '../../lib/format'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'
import Tag from '../ui/Tag'
import { CARD_TONES } from './cardTones'

const WORK_MODE_TONE = { Remote: 'violet', Hybrid: 'amber', 'On-site': 'navy' }

function daysSince(dateValue) {
  if (!dateValue) return null
  const diffMs = Date.now() - new Date(dateValue).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

function MetaItem({ icon, label }) {
  const { colors, fontFamily } = useTheme()
  if (!label) return null
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Feather name={icon} size={12.5} color={colors.inkTertiary} />
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5 }}>{label}</Text>
    </View>
  )
}

export default function JobOpeningCard({ job, applied, index = 0, onPress, featured = false, tone = null, distanceKm = null }) {
  const { colors, spacing, radius, fontFamily, isDark } = useTheme()
  const days = daysSince(job.postedOn)
  const isNew = days !== null && days <= 2
  const salary = fmtSalaryRange(job)
  const workModeTone = WORK_MODE_TONE[job.workMode] ?? 'teal'
  const railColor = applied ? colors.green : isNew ? colors.teal : null
  const cardTone = tone ?? (featured ? CARD_TONES[0] : null)

  const reduceMotion = useReducedMotion()
  const lift = useSharedValue(0)
  const liftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }, { scale: 1 + lift.value * 0.005 }] }))

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(220)} style={liftStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          lift.value = withSpring(reduceMotion ? 0 : -2, { damping: 16, stiffness: 380 })
        }}
        onPressOut={() => {
          lift.value = withSpring(0, { damping: 16, stiffness: 380 })
        }}
        accessibilityRole="button"
        accessibilityLabel={`${job.title} at ${job.company}`}
      >
        <Card
          style={[
            { marginBottom: spacing.md, padding: spacing.md, overflow: 'hidden' },
            featured ? { borderRadius: radius.md } : null,
            cardTone ? { backgroundColor: cardTone.bg, borderColor: cardTone.border } : null,
            Platform.select({
              ios: { shadowOpacity: isDark ? 0.14 : featured ? 0.035 : 0.045, shadowRadius: featured ? 6 : 10, shadowOffset: { width: 0, height: featured ? 1 : 2 } },
              android: { elevation: isDark ? 0 : featured ? 1 : 2 },
            }),
          ]}
        >
          {railColor ? (
            <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, backgroundColor: railColor }} />
          ) : null}
          <View style={{ flexDirection: 'row' }}>
            <View
              style={[
                { borderRadius: radius.md + 2, padding: 2, marginRight: spacing.md, borderWidth: 1, borderColor: cardTone?.border ?? colors.border },
                Platform.select({
                  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 3 },
                  android: { elevation: 0 },
                }),
              ]}
            >
              <Avatar name={job.company} size={48} style={{ borderRadius: radius.sm }} />
            </View>
            <View style={{ flex: 1 }}>
              {featured ? (
                <Text style={{ color: colors.teal, fontFamily: fontFamily.bold, fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 3 }}>
                  Featured role
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                <Text style={{ flex: 1, color: colors.ink, fontFamily: fontFamily.bold, fontSize: 15.5 }} numberOfLines={1}>
                  {job.title}
                </Text>
                {isNew ? <Badge label="New" tone="teal" /> : null}
              </View>
              <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.semibold, fontSize: 13.5, marginTop: 2 }} numberOfLines={1}>
                {job.company}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4, marginTop: spacing.sm }}>
                <MetaItem icon="briefcase" label={fmtExperience(job)} />
                <MetaItem icon="map-pin" label={distanceKm != null ? `${job.location} · ${Math.round(distanceKm)} km away` : job.location} />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
                {salary ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: colors.greenTint,
                      borderRadius: radius.sm,
                      paddingVertical: 4,
                      paddingHorizontal: 9,
                    }}
                  >
                    <Feather name="check" size={11} color={colors.green} />
                    <Text style={{ color: colors.green, fontFamily: fontFamily.semibold, fontSize: 11.5 }}>{salary}</Text>
                  </View>
                ) : null}
                {job.workMode ? <Badge label={job.workMode} tone={workModeTone} /> : null}
                {(job.skills ?? []).slice(0, 2).map((skill) => (
                  <Tag key={skill} label={skill} />
                ))}
              </View>

              {job.matchReasons?.[0] ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: spacing.xs }}>
                  <Feather name="star" size={11} color={colors.teal} style={{ marginTop: 1 }} />
                  <Text style={{ flex: 1, color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 11.5 }} numberOfLines={1}>
                    {job.matchReasons[0]}
                  </Text>
                </View>
              ) : null}

              {featured && job.description ? (
                <Text
                  style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 12.5, lineHeight: 18, marginTop: spacing.sm }}
                  numberOfLines={2}
                >
                  {job.description}
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: spacing.md,
                  paddingTop: spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: cardTone?.border ?? colors.border,
                }}
              >
                <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 12 }}>
                  {job.posted ? `Posted ${job.posted}` : ''}
                  {job.vacancies ? `  ·  ${job.vacancies} opening${job.vacancies > 1 ? 's' : ''}` : ''}
                </Text>
                {applied ? (
                  <Badge label="Applied" tone="green" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 12 }}>View role</Text>
                    <Feather name="chevron-right" size={14} color={colors.teal} />
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
