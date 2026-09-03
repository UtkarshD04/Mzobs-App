import { View, Text, Pressable, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { openDrawer } from '../../lib/navigation'
import BrandLogo from '../ui/BrandLogo'

function IconButton({ icon, onPress, accessibilityLabel, children }) {
  const { colors, isDark } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 3 },
          android: { elevation: 0 },
        }),
      ]}
    >
      <Feather name={icon} size={18} color={colors.ink} />
      {children}
    </Pressable>
  )
}

export default function HomeTopBar({ navigation, unreadCount }) {
  const { colors, spacing, fontFamily } = useTheme()
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <View
      style={{
        backgroundColor: colors.bgSecondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <IconButton icon="menu" onPress={() => openDrawer(navigation)} accessibilityLabel="Open menu" />
          <BrandLogo height={22} />
        </View>

        <IconButton icon="bell" onPress={() => navigation.navigate('Notifications')} accessibilityLabel="Notifications">
          {unreadCount > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 17,
                height: 17,
                paddingHorizontal: 3,
                borderRadius: 9,
                backgroundColor: colors.red,
                borderWidth: 1.5,
                borderColor: colors.bgSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontFamily: fontFamily.bold, fontSize: 9.5, includeFontPadding: false }}>{badgeLabel}</Text>
            </View>
          ) : null}
        </IconButton>
      </View>
    </View>
  )
}
