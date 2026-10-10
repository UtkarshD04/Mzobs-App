import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as premiumServicesService from '../services/premiumServicesService'
import { queryKeys } from '../lib/queryClient'

// `enabled` keeps Basic accounts from calling an endpoint that only matters once paid.
export function useServiceRequestsQuery({ enabled = true } = {}) {
  return useQuery({ queryKey: queryKeys.serviceRequests, queryFn: premiumServicesService.listServiceRequests, enabled })
}

export function useRequestServiceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: premiumServicesService.requestService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests }),
    // ALREADY_REQUESTED means our list is stale; PREMIUM_REQUIRED means the profile is.
    onError: (err) => {
      const code = err.response?.data?.code
      if (code === 'ALREADY_REQUESTED') queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests })
      if (code === 'PREMIUM_REQUIRED') queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

export function useCancelServiceRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: premiumServicesService.cancelServiceRequest,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests }),
  })
}
