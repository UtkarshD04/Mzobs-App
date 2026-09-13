import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as notificationPreferencesService from '../services/notificationPreferencesService'
import { queryKeys } from '../lib/queryClient'

export function useNotificationPreferencesQuery() {
  return useQuery({ queryKey: queryKeys.notificationPreferences, queryFn: notificationPreferencesService.getNotificationPreferences })
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationPreferencesService.updateNotificationPreferences,
    onSuccess: (data) => queryClient.setQueryData(queryKeys.notificationPreferences, data),
  })
}
