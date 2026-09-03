import { View, Text, Pressable, Platform } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { fmtSalaryRange, fmtExperience } from '../../lib/format'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'
import Tag from '../ui/Tag'

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

export default function JobOpeningCard({ job, applied, index = 0, onPress }) {
  const { colors, spacing, radius, fontFamily, isDark } = useTheme()
  const days = daysSince(job.postedOn)
  const isNew = days !== null && days <= 2
  const salary = fmtSalaryRange(job)
  const workModeTone = WORK_MODE_TONE[job.workMode] ?? 'teal'
  const railColor = applied ? colors.green : isNew ? colors.teal : null

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(220)}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${job.title} at ${job.company}`}>
        <Card
          style={[
            { marginBottom: spacing.md, padding: spacing.md, overflow: 'hidden' },
            Platform.select({
              ios: { shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
              android: { elevation: isDark ? 0 : 3 },
            }),
          ]}
        >
          {railColor ? (
            <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, backgroundColor: railColor }} />
          ) : null}
          <View style={{ flexDirection: 'row' }}>
            <View
              style={[
                { borderRadius: radius.md + 2, padding: 2, marginRight: spacing.md, borderWidth: 1, borderColor: colors.border },
                Platform.select({
                  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 3 },
                  android: { elevation: 0 },
                }),
              ]}
            >
              <Avatar name={job.company} size={48} style={{ borderRadius: radius.sm }} />
            </View>
            <View style={{ flex: 1 }}>
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
                <MetaItem icon="map-pin" label={job.location} />
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
