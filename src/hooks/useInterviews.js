import { useQuery } from '@tanstack/react-query'
import * as interviewsService from '../services/interviewsService'
import { queryKeys } from '../lib/queryClient'

export function useInterviewsQuery() {
  return useQuery({ queryKey: queryKeys.interviews, queryFn: interviewsService.listInterviews })
}
