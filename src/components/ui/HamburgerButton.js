import { Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { openDrawer } from '../../lib/navigation'

export default function HamburgerButton({ navigation }) {
  const { colors } = useTheme()
  return (
    <Pressable onPress={() => openDrawer(navigation)} hitSlop={10} style={{ marginLeft: 16 }}>
      <Feather name="menu" size={22} color={colors.ink} />
    </Pressable>
  )
}
