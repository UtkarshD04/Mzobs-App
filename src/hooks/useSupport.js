import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as supportService from '../services/supportService'
import { queryKeys } from '../lib/queryClient'

export function useSupportTicketsQuery() {
  return useQuery({ queryKey: queryKeys.supportTickets, queryFn: supportService.listTickets })
}

export function useSubmitTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: supportService.submitTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.supportTickets }),
  })
}
