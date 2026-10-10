import { View, Text, ScrollView, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'

// "Career toolkit": one horizontal row of big icon tiles with a label under
// each — the app's shortcuts to everything a candidate does besides browsing
// jobs. Tone keys are theme colour families (see theme/colors.js).
const TOOLS = [
  { key: 'resume', label: 'Resume builder', icon: 'file-text', tone: 'teal' },
  { key: 'applications', label: 'My applications', icon: 'clipboard', tone: 'violet' },
  { key: 'saved', label: 'Saved jobs', icon: 'bookmark', tone: 'amber' },
  { key: 'profile', label: 'Complete profile', icon: 'user-check', tone: 'green' },
  { key: 'plans', label: 'Premium plans', icon: 'award', tone: 'gold' },
  { key: 'support', label: 'Help & support', icon: 'life-buoy', tone: 'red' },
]

export default function CareerToolkit({ onPress }) {
  const { colors, spacing, fontFamily } = useTheme()

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3, paddingHorizontal: spacing.lg }}>Career toolkit</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: 16, gap: 14 }}>
        {TOOLS.map((t) => (
          <Pressable key={t.key} onPress={() => onPress(t.key)} accessibilityRole="button" style={{ width: 82, alignItems: 'center' }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors[`${t.tone}Tint`],
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Feather name={t.icon} size={26} color={colors[t.tone]} />
            </View>
            <Text style={{ color: colors.ink, fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 17, textAlign: 'center', marginTop: 8 }} numberOfLines={2}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
