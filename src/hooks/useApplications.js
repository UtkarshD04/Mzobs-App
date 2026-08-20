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
