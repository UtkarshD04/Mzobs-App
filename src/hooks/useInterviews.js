import { useQuery } from '@tanstack/react-query'
import * as interviewsService from '../services/interviewsService'
import { queryKeys } from '../lib/queryClient'

export function useInterviewsQuery({ enabled = true } = {}) {
  return useQuery({ queryKey: queryKeys.interviews, queryFn: interviewsService.listInterviews, enabled })
}

export function useMockInterviewQuery({ enabled = true } = {}) {
  return useQuery({ queryKey: queryKeys.mockInterview, queryFn: interviewsService.getMockInterview, enabled })
}
