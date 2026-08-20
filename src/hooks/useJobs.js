import { useQuery } from '@tanstack/react-query'
import * as jobsService from '../services/jobsService'
import { queryKeys } from '../lib/queryClient'

export function useJobsQuery(filters = {}) {
  return useQuery({ queryKey: queryKeys.jobs(filters), queryFn: () => jobsService.listJobs(filters) })
}

export function useJobQuery(id) {
  return useQuery({ queryKey: queryKeys.job(id), queryFn: () => jobsService.getJob(id), enabled: !!id })
}
