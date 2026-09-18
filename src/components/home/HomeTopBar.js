import { View, Text, Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { openDrawer } from '../../lib/navigation'
import BrandLogo from '../ui/BrandLogo'

function IconButton({ icon, onPress, accessibilityLabel, children }) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginHorizontal: -10 }}
    >
      <Feather name={icon} size={20} color={colors.ink} />
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
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <IconButton icon="menu" onPress={() => openDrawer(navigation)} accessibilityLabel="Open menu" />
        <BrandLogo height={22} />
      </View>

      <IconButton icon="bell" onPress={() => navigation.navigate('Notifications')} accessibilityLabel="Notifications">
        {unreadCount > 0 ? (
          <View
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              minWidth: 16,
              height: 16,
              paddingHorizontal: 3,
              borderRadius: 8,
              backgroundColor: colors.red,
              borderWidth: 1.5,
              borderColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontFamily: fontFamily.bold, fontSize: 9.5, includeFontPadding: false }}>{badgeLabel}</Text>
          </View>
        ) : null}
      </IconButton>
    </View>
  )
}
