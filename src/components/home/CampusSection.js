import { ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../theme'
import PressableScale from '../ui/PressableScale'

// "From Campus to Career." — campus network section: a stat card (colleges
// attached) plus three cards for the audiences the website's campus push
// targets (placement cells, students/freshers, campus ambassadors).
const CARDS = [
  {
    key: 'placement',
    icon: 'business-outline',
    title: 'Placement cells',
    desc: 'Bring your whole batch onto Mzobs and give students one place to discover employers hiring freshers.',
  },
  {
    key: 'students',
    icon: 'school-outline',
    title: 'Students & freshers',
    desc: 'Build your profile before you graduate and discover fresher-friendly roles and internships.',
    cta: 'Create your profile',
  },
  {
    key: 'ally',
    icon: 'megaphone-outline',
    title: 'Mzobs Ally',
    desc: 'Represent Mzobs on your campus, help classmates get hired and build real-world experience of your own.',
    cta: 'Become an Ally',
  },
]

const GRADIENT = ['#0b7a6d', '#0f8b7d']

const CARD_WIDTH = 252

function StatCard() {
  const { fontFamily } = useTheme()
  return (
    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: 32, letterSpacing: -0.6 }}>100+</Text>
      <Text style={{ color: 'rgba(255,255,255,0.9)', fontFamily: fontFamily.semibold, fontSize: 13, marginTop: 6, textAlign: 'center' }}>Campuses on Mzobs</Text>
    </LinearGradient>
  )
}

function InfoCard({ icon, title, desc, cta, onPress }) {
  const { colors, fontFamily } = useTheme()
  return (
    <View style={{ width: CARD_WIDTH, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
      <LinearGradient colors={GRADIENT} style={{ position: 'absolute', top: -32, right: -32, width: 96, height: 96, borderRadius: 48, opacity: 0.07 }} />
      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color="#fff" />
      </LinearGradient>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 17, letterSpacing: -0.2, marginTop: 16 }}>{title}</Text>
      <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 21, marginTop: 6 }}>{desc}</Text>
      {cta ? (
        <PressableScale
        onPress={onPress}
        scaleTo={0.97}
        accessibilityRole="button"
        style={{
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 16,
          height: 36,
          paddingHorizontal: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13.5 }}>{cta}</Text>
        <Ionicons name="arrow-forward" size={13} color={colors.ink} />
      </PressableScale>
      ) : null}
    </View>
  )
}

export default function CampusSection({ onCreateProfile, onBecomeAlly }) {
  const { colors, spacing, fontFamily } = useTheme()
  const actions = { students: onCreateProfile, ally: onBecomeAlly }

  return (
    <View style={{ paddingVertical: 24, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3 }}>
          From Campus to <Text style={{ color: colors.navy }}>Career.</Text>
        </Text>
        <Text style={{ color: colors.inkTertiary, fontFamily: fontFamily.regular, fontSize: 14, marginTop: 4 }}>
          Mzobs works with colleges to give students a direct route from the classroom to their first job.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 20, gap: 12 }}
      >
        <StatCard />
        {CARDS.map((c) => (
          <InfoCard key={c.key} icon={c.icon} title={c.title} desc={c.desc} cta={c.cta} onPress={actions[c.key]} />
        ))}
      </ScrollView>
    </View>
  )
}
