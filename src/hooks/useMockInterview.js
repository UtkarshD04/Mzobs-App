import { useQuery } from '@tanstack/react-query'
import * as mockInterviewService from '../services/mockInterviewService'
import { queryKeys } from '../lib/queryClient'

export function useMockInterviewQuery() {
  return useQuery({ queryKey: queryKeys.mockInterview, queryFn: mockInterviewService.getMockInterview })
}
