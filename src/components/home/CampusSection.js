import { ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
    cta: 'Partner with us',
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

const CARD_WIDTH = 240

function StatCard() {
  const { colors, radius, fontFamily } = useTheme()
  return (
    <View
      style={{
        width: CARD_WIDTH,
        minHeight: 220,
        borderRadius: radius.xl,
        backgroundColor: colors.navy,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: 38, letterSpacing: -0.5 }}>100+</Text>
      <Text style={{ color: 'rgba(255,255,255,0.9)', fontFamily: fontFamily.semibold, fontSize: 13.5, marginTop: 4, textAlign: 'center' }}>
        Campuses on Mzobs
      </Text>
    </View>
  )
}

function InfoCard({ icon, title, desc, cta, onPress }) {
  const { colors, radius, fontFamily } = useTheme()
  return (
    <View
      style={{
        width: CARD_WIDTH,
        minHeight: 220,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        gap: 10,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color="#fff" />
      </View>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 16.5 }}>{title}</Text>
      <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18.5, flexShrink: 1 }}>{desc}</Text>
      <PressableScale
        onPress={onPress}
        scaleTo={0.96}
        accessibilityRole="button"
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto', alignSelf: 'flex-start' }}
      >
        <Text style={{ color: colors.ink, fontFamily: fontFamily.semibold, fontSize: 13 }}>{cta}</Text>
        <Ionicons name="arrow-forward" size={13} color={colors.ink} />
      </PressableScale>
    </View>
  )
}

export default function CampusSection({ onPartner, onCreateProfile, onBecomeAlly }) {
  const { colors, spacing, fontFamily } = useTheme()
  const actions = { placement: onPartner, students: onCreateProfile, ally: onBecomeAlly }

  return (
    <View style={{ marginTop: spacing.xl }}>
      <View style={{ alignItems: 'center', paddingHorizontal: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.navy }} />
          <Text style={{ color: colors.navy, fontFamily: fontFamily.bold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Campus network
          </Text>
        </View>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 29, marginTop: 6, textAlign: 'center' }}>
          From Campus to <Text style={{ color: colors.navy }}>Career.</Text>
        </Text>
        <Text
          style={{
            color: colors.inkSecondary,
            fontFamily: fontFamily.regular,
            fontSize: 13.5,
            lineHeight: 19,
            marginTop: spacing.sm,
            textAlign: 'center',
          }}
        >
          Mzobs works with colleges to give students a direct route from the classroom to their first job.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}
      >
        <StatCard />
        {CARDS.map((c) => (
          <InfoCard key={c.key} icon={c.icon} title={c.title} desc={c.desc} cta={c.cta} onPress={actions[c.key]} />
        ))}
      </ScrollView>
    </View>
  )
}
