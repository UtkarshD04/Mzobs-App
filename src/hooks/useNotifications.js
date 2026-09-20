import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as notificationsService from '../services/notificationsService'
import { queryKeys } from '../lib/queryClient'

export function useNotificationsQuery() {
  // Polled while the app is open so new notifications (and the badge) show up even if the
  // push itself didn't arrive; React Query pauses this in the background.
  return useQuery({ queryKey: queryKeys.notifications, queryFn: notificationsService.listNotifications, refetchInterval: 60_000 })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsService.markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationsService.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })
}

export function useSendTestPushMutation() {
  return useMutation({ mutationFn: notificationsService.sendTestPush })
}
