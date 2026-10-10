import { useEffect, useState } from 'react'
import { View, Text, Image } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { useTheme } from '../../theme'
import PressableScale from '../ui/PressableScale'
import { COMPANIES_HIRING_DATA } from './companiesHiringData'

// Mirrors the website's CompaniesSection.jsx: round logo badges gliding
// right-to-left in a seamless auto-scroll loop (not a user-dragged row) —
// the set is rendered twice back to back and translated by exactly one
// copy's width, so the reset from -width back to 0 is invisible.
const CIRCLE = 104
const GAP = 24
const PX_PER_SEC = 60 // scroll speed in pixels per second (was 26)

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
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
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
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      {company.logo ? (
        <Image source={company.logo} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ color: '#075f55', fontFamily: fontFamily.bold, fontSize: 24 }}>{initialsOf(company.name)}</Text>
      )}
    </PressableScale>
  )
}

export default function CompaniesHiringSection({ onSeeAll }) {
  const { colors, spacing, fontFamily } = useTheme()
  const [setWidth, setSetWidth] = useState(0)
  const offset = useSharedValue(0)

  const doubled = [...COMPANIES_HIRING_DATA, ...COMPANIES_HIRING_DATA]

  useEffect(() => {
    if (!setWidth) return
    offset.value = 0
    offset.value = withRepeat(withTiming(-setWidth, { duration: (setWidth / PX_PER_SEC) * 1000, easing: Easing.linear }), -1, false)
  }, [setWidth])

  const trackStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }))

  return (
    <View style={{ paddingVertical: 24, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Text style={{ color: colors.ink, fontFamily: fontFamily.bold, fontSize: 20, letterSpacing: -0.3 }}>Companies hiring through Mzobs</Text>
      </View>

      <View style={{ marginTop: 16, height: CIRCLE + 16, overflow: 'hidden' }}>
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
