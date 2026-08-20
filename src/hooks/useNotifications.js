import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as notificationsService from '../services/notificationsService'
import { queryKeys } from '../lib/queryClient'

export function useNotificationsQuery() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: notificationsService.listNotifications })
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
