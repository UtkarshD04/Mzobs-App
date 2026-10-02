import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import Button from '../ui/Button'

// Mirrors the website's MatchSection.jsx: "Stop Searching. Start
// Matching." copy plus a worked example of how a match is explained. The
// website's animated SVG ring is replaced with a plain percentage badge —
// the factor bars carry the same four labels/values as the site's example
// (Skills 96%, Experience 92%, Location 100%, Role preference 88%).
// This is a different, website-parity static section — distinct from
// MatchedForYouSection.js, which renders the candidate's REAL live
// recommendations further down Home.
const SKILLS = ['Python', 'React', 'SQL', 'AWS']
const BARS = [
  { label: 'Skills', value: 96 },
  { label: 'Experience', value: 92 },
  { label: 'Location', value: 100 },
  { label: 'Role preference', value: 88 },
]
const POINTS = [
  'A match score for every role, with the reasons behind it',
  'Recommendations that improve as your profile does',
  'Employers see candidates ranked by fit, not by who applied first',
]

function MatchPanel() {
  const { colors, radius, spacing, fontFamily } = useTheme()
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.semibold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Example match
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.tealTint,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 20,
          }}
        >
          <Feather name="star" size={11} color={colors.teal} />
          <Text style={{ color: colors.teal, fontFamily: fontFamily.semibold, fontSize: 11 }}>Top match</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            borderWidth: 8,
            borderColor: colors.navy,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20 }}>94%</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.medium, fontSize: 11.5 }}>Candidate</Text>
          <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16 }}>Software Engineer</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {SKILLS.map((s) => (
              <View key={s} style={{ backgroundColor: colors.navyTint, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: colors.navy, fontFamily: fontFamily.medium, fontSize: 11.5 }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {BARS.map((b) => (
          <View key={b.label}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="check" size={9} color="#fff" />
                </View>
                <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.medium, fontSize: 12.5 }}>{b.label}</Text>
              </View>
              <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 12.5 }}>{b.value}%</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgSecondary, overflow: 'hidden' }}>
              <View style={{ width: `${b.value}%`, height: '100%', borderRadius: 4, backgroundColor: colors.navy }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function MatchSection({ onGetMatches, onBrowseJobs }) {
  const { colors, spacing, fontFamily } = useTheme()

  return (
    <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.lg }}>
      <Text style={{ color: colors.navy, fontFamily: fontFamily.semibold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        Intelligent matching
      </Text>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 27, marginTop: 4 }}>
        Stop Searching. <Text style={{ color: colors.navy }}>Start Matching.</Text>
      </Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 19, marginTop: spacing.sm }}>
        Instead of scrolling an endless list, Mzobs compares your skills, experience, location and role preference with each opening — and tells you why it
        fits.
      </Text>

      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        {POINTS.map((t) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: colors.navyTint,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Feather name="star" size={10} color={colors.navy} />
            </View>
            <Text style={{ flex: 1, color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 19 }}>{t}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Button title="Get my matches" onPress={onGetMatches} style={{ flexGrow: 1 }} />
        <Button title="Browse jobs" variant="secondary" onPress={onBrowseJobs} style={{ flexGrow: 1 }} />
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <MatchPanel />
      </View>
    </View>
  )
}
