import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as resumeService from '../services/resumeService'
import { queryKeys } from '../lib/queryClient'

export function useResumeQuery() {
  return useQuery({ queryKey: queryKeys.resume, queryFn: resumeService.getResume })
}

export function useUploadResumeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resumeService.uploadResume,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.resume, data)
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}
