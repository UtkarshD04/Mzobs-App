import { useEffect, useState } from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { useTheme } from '../../theme'
import { COMPANIES_HIRING_DATA } from './companiesHiringData'

// Mirrors the website's CompaniesHiring.jsx: round logo badges gliding
// right-to-left in a seamless auto-scroll loop (not a user-dragged row) —
// the set is rendered twice back to back and translated by exactly one
// copy's width, so the reset from -width back to 0 is invisible.
const CIRCLE = 108
const GAP = 18
const PX_PER_SEC = 26 // roughly matches the website's 40s-for-desktop-width pace, scaled to a phone

function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function CompanyCircle({ company, onPress }) {
  const { colors, fontFamily } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${company.name}, view company jobs`}
      style={{
        width: CIRCLE,
        height: CIRCLE,
        borderRadius: CIRCLE / 2,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 3,
      }}
    >
      {company.logo ? (
        <Image source={company.logo} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ color: colors.teal, fontFamily: fontFamily.bold, fontSize: 16 }}>{initialsOf(company.name)}</Text>
      )}
    </Pressable>
  )
}

export default function CompaniesHiringSection({ onSeeAll }) {
  const { colors, spacing, fontFamily } = useTheme()
  const [setWidth, setSetWidth] = useState(0)
  const offset = useSharedValue(0)

  const industryCount = new Set(COMPANIES_HIRING_DATA.map((c) => c.industry)).size
  const doubled = [...COMPANIES_HIRING_DATA, ...COMPANIES_HIRING_DATA]

  useEffect(() => {
    if (!setWidth) return
    offset.value = 0
    offset.value = withRepeat(withTiming(-setWidth, { duration: (setWidth / PX_PER_SEC) * 1000, easing: Easing.linear }), -1, false)
  }, [setWidth])

  const trackStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }))

  return (
    <View style={{ marginTop: spacing.xl }}>
      <View style={{ alignItems: 'center', paddingHorizontal: spacing.lg }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3, textAlign: 'center' }}>
          Companies hiring through MZOBS
        </Text>
        <Text style={{ color: colors.inkSecondary, fontFamily: fontFamily.regular, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
          {COMPANIES_HIRING_DATA.length} verified partners across {industryCount} industries.
        </Text>
      </View>

      <View style={{ marginTop: spacing.lg, height: CIRCLE + 16, overflow: 'hidden' }}>
        <Animated.View
          style={[{ flexDirection: 'row', paddingVertical: 8 }, trackStyle]}
          onLayout={(e) => {
            // Full row is two copies back to back — one copy's width is half.
            const w = e.nativeEvent.layout.width / 2
            if (w && Math.abs(w - setWidth) > 1) setSetWidth(w)
          }}
        >
          {doubled.map((company, i) => (
            <View key={`${company.name}-${i}`} style={{ marginRight: GAP }}>
              <CompanyCircle company={company} onPress={onSeeAll} />
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  )
}
