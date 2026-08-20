import { useQuery } from '@tanstack/react-query'
import * as subscriptionService from '../services/subscriptionService'
import { queryKeys } from '../lib/queryClient'

export function useSubscriptionQuery() {
  return useQuery({ queryKey: queryKeys.subscription, queryFn: subscriptionService.getSubscription })
}
