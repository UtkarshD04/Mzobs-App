import { useTheme } from '../../../theme'
import ScreenContainer from '../ScreenContainer'
import Card from '../Card'
import Skeleton from '../Skeleton'

export default function MockInterviewSkeleton() {
  const { spacing } = useTheme()

  return (
    <ScreenContainer>
      <Skeleton width={150} height={20} />
      <Skeleton width="90%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 6 }} />

      <Card style={{ marginTop: spacing.lg }}>
        <Skeleton width="50%" height={14} />
        <Skeleton width="95%" height={11} style={{ marginTop: spacing.sm }} />
        <Skeleton width="80%" height={11} style={{ marginTop: 6 }} />
      </Card>

      <Card style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <Skeleton width={140} height={14} />
        <Skeleton width={90} height={12} style={{ marginTop: 6 }} />
      </Card>
    </ScreenContainer>
  )
}
