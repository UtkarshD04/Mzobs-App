import { View } from 'react-native'
import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

export default function ResumeSkeleton() {
  const { spacing } = useTheme()

  return (
    <ScreenContainer>
      <Skeleton width={160} height={20} />
      <Skeleton width="85%" height={12} style={{ marginTop: 8 }} />

      <Card style={{ marginTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width="55%" height={15} />
          <Skeleton width={70} height={20} radius={8} />
        </View>
        <Skeleton width={140} height={20} style={{ marginTop: spacing.md }} />
        <Skeleton height={46} radius={12} style={{ marginTop: spacing.lg }} />
      </Card>
    </ScreenContainer>
  )
}
