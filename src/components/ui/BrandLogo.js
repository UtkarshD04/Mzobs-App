import { Image } from 'react-native'

export default function BrandLogo({ height = 40 }) {
  return <Image source={require('../../../assets/logo.png')} style={{ height, width: height * (5000 / 2725) }} resizeMode="contain" />
}
