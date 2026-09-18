import { useCallback, useState } from 'react'
import { FlatList } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useJobsQuery } from '../hooks/useJobs'
import { useApplicationsQuery } from '../hooks/useApplications'
import { getSavedJobIds, jobSaveKey } from '../lib/savedJobs'
import JobOpeningCard from '../components/home/JobOpeningCard'
import ScreenContainer from '../components/ui/ScreenContainer'
import EmptyState from '../components/ui/EmptyState'
import JobRowSkeleton from '../components/ui/skeletons/JobRowSkeleton'

export default function SavedJobsScreen({ navigation }) {
  const { data: jobs = [], isLoading, refetch, isRefetching } = useJobsQuery()
  const { data: applications = [] } = useApplicationsQuery()
  const [savedIds, setSavedIds] = useState(null)

  // Reload the saved-id list every time this screen regains focus — jobs
  // are saved/unsaved from a JobOpeningCard's own bookmark icon (here, on
  // Home, or in search results), so there's no shared in-memory state to
  // subscribe to, only the SecureStore-backed list in lib/savedJobs.js.
  useFocusEffect(
    useCallback(() => {
      let active = true
      getSavedJobIds().then((ids) => {
        if (active) setSavedIds(ids)
      })
      return () => {
        active = false
      }
    }, [])
  )

  if (isLoading || savedIds === null) return <JobRowSkeleton />

  const savedIdSet = new Set(savedIds)
  const savedJobs = jobs.filter((job) => savedIdSet.has(jobSaveKey(job)))
  const appliedJobIds = new Set(applications.map((a) => a.jobId ?? a.job?.id))

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <JobOpeningCard
            job={item}
            applied={appliedJobIds.has(item.id)}
            index={index}
            onPress={() => navigation.navigate('Main', { screen: 'Jobs', params: { screen: 'JobDetail', params: { id: item.id } } })}
          />
        )}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={
          <EmptyState icon="bookmark" title="No saved jobs yet" message="Tap the bookmark icon on a job card to save it for later." />
        }
      />
    </ScreenContainer>
  )
}
