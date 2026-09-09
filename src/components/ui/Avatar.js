import { View, Text } from 'react-native'
import { useTheme } from '../../theme'

function initialsOf(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Deterministic tonal colour per name (company or person) — matches the
// website's job cards, where each company avatar gets a soft, consistent
// tint keyed off its name hash rather than one flat brand colour everywhere.
const TONES = ['navy', 'teal', 'violet', 'gold', 'green', 'amber']
function toneOf(name) {
  const str = name ?? ''
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return TONES[hash % TONES.length]
}

export default function Avatar({ name, size = 56, style }) {
  const { colors, fontFamily } = useTheme()
  const tone = toneOf(name)

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          // A squircle (large fixed corner radius, not size/2) reads as a
          // company mark rather than a person's profile photo — matches the
          // website's job-card avatars.
          borderRadius: Math.round(size * 0.32),
          backgroundColor: colors[`${tone}Tint`] ?? colors.navyTint,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors[`${tone}TintStrong`] ?? colors[`${tone}Tint`] ?? colors.navyTintStrong,
        },
        style,
      ]}
    >
      <Text style={{ color: colors[tone] ?? colors.navy, fontFamily: fontFamily.bold, fontSize: size * 0.36 }}>{initialsOf(name)}</Text>
    </View>
  )
}
