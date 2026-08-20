import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as profileService from '../services/profileService'
import { queryKeys } from '../lib/queryClient'

export function useProfileQuery() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: profileService.getProfile })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => queryClient.setQueryData(queryKeys.profile, data),
  })
}
