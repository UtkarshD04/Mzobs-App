import { Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { openDrawer } from '../../lib/navigation'

export default function HamburgerButton({ navigation }) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={() => openDrawer(navigation)}
      hitSlop={10}
      style={{
        marginLeft: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceHover,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Feather name="menu" size={19} color={colors.ink} />
    </Pressable>
  )
}
