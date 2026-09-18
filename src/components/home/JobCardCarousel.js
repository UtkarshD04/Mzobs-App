import { View, ScrollView, useWindowDimensions } from 'react-native'
import { useTheme } from '../../theme'
import JobOpeningCard from './JobOpeningCard'

// Every card in a row gets this height and clips to it — JobOpeningCard's
// content otherwise varies slightly (a skills tag wrapping to a second
// line, a longer location string) which reads as uneven card sizes in a
// side-by-side carousel, even though it's barely noticeable stacked
// vertically one at a time.
const CARD_HEIGHT = 272

// Horizontal, snap-scrolling row of job cards — used for the personalized
// job rows on Home. Each card is a deliberate ~88% of the viewport so the
// next card always peeks in by a clearly-intentional sliver (not an
// accidental clip at the screen edge), signalling "swipe for more".
export default function JobCardCarousel({ jobs, appliedJobIds, onPressJob }) {
  const { spacing } = useTheme()
  const { width } = useWindowDimensions()
  const cardWidth = Math.min(340, width * 0.88)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={cardWidth + spacing.sm}
      snapToAlignment="start"
      contentContainerStyle={{ paddingHorizontal: spacing.lg }}
    >
      {jobs.map((job, index) => (
        <View key={job.id} style={{ width: cardWidth, height: CARD_HEIGHT, marginRight: spacing.sm, overflow: 'hidden' }}>
          <JobOpeningCard job={job} applied={appliedJobIds?.has(job.id)} index={index} onPress={() => onPressJob(job)} />
        </View>
      ))}
    </ScrollView>
  )
}
