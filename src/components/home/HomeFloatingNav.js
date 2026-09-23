import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, interpolate, interpolateColor, Extrapolation } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { openDrawer } from '../../lib/navigation'
import BrandLogo from '../ui/BrandLogo'

// Mirrors the website's Navbar.jsx: `position: fixed`, transparent and
// full-width at the very top of the page, condensing into a floating white
// pill (smaller, inset margins, border, shadow) once the page scrolls past
// a few pixels — and staying fixed over the content the whole time, not
// scrolling away with it like the old flat HomeTopBar did.
// `scrollY` is a shared value the screen updates via useAnimatedScrollHandler.
// No true backdrop-blur (expo-blur isn't a dependency here) — approximated
// with a near-opaque surface tint instead.
const THRESHOLD = 40

export default function HomeFloatingNav({ navigation, unreadCount, scrollY }) {
  const { colors, fontFamily, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  const outerStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP)
    return {
      marginTop: insets.top + p * 8,
      marginHorizontal: p * 14,
      borderRadius: p * 999,
      height: 64,
    }
  })

  const chromeStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [0, THRESHOLD], [0, 1], Extrapolation.CLAMP)
    return {
      opacity: p,
      borderRadius: p * 999,
      backgroundColor: interpolateColor(scrollY.value, [0, THRESHOLD], ['rgba(255,255,255,0)', isDark ? colors.surface : 'rgba(255,255,255,0.92)']),
    }
  })

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <Animated.View style={outerStyle}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderWidth: 1, borderColor: colors.border, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 18, elevation: 3 },
            chromeStyle,
          ]}
        />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
          <BrandLogo height={30} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}
            >
              <Feather name="bell" size={21} color={colors.ink} />
              {unreadCount > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 3,
                    borderRadius: 8,
                    backgroundColor: colors.red,
                    borderWidth: 1.5,
                    borderColor: colors.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: 9.5, includeFontPadding: false }}>{badgeLabel}</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              onPress={() => openDrawer(navigation)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="menu" size={21} color={colors.ink} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  )
}
