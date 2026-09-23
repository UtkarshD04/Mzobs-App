import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as applicationsService from '../services/applicationsService'
import { queryKeys } from '../lib/queryClient'

export function useApplicationsQuery() {
  return useQuery({ queryKey: queryKeys.applications, queryFn: applicationsService.listApplications })
}

export function useApplyToJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applicationsService.applyToJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications }),
  })
}

export function useWithdrawApplicationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applicationsService.withdrawApplication,
    // Card leaves the list immediately; rolled back if the request fails.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.applications })
      const previous = queryClient.getQueryData(queryKeys.applications)
      queryClient.setQueryData(queryKeys.applications, (old) => (old ?? []).filter((a) => a.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => queryClient.setQueryData(queryKeys.applications, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.applications }),
  })
}
