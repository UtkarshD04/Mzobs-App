import { View } from 'react-native'
import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

export default function InterviewCenterSkeleton() {
  const { spacing } = useTheme()

  return (
    <ScreenContainer>
      <Skeleton width={170} height={20} />
      <Skeleton width="85%" height={12} style={{ marginTop: 8 }} />

      <Card style={{ marginTop: spacing.lg }}>
        <Skeleton width={130} height={14} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton width={22} height={22} radius={11} />
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
        <Skeleton height={44} radius={12} style={{ marginTop: spacing.lg }} />
      </Card>
    </ScreenContainer>
  )
}
