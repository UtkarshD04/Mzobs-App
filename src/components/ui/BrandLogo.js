import { Image } from 'react-native'
import { useTheme } from '../../theme'

// Wordmark is navy-on-transparent — invisible on a dark surface, so dark
// mode swaps in the white-on-transparent variant instead.
export default function BrandLogo({ height = 40 }) {
  const { isDark } = useTheme()
  return (
    <Image
      source={isDark ? require('../../../assets/logo-dark.png') : require('../../../assets/logo.png')}
      style={{ height, width: height * (5000 / 2725) }}
      resizeMode="contain"
    />
  )
}
