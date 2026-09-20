import { useQuery } from '@tanstack/react-query'
import * as jobsService from '../services/jobsService'
import { queryKeys } from '../lib/queryClient'

export function useJobsQuery(filters = {}) {
  return useQuery({ queryKey: queryKeys.jobs(filters), queryFn: () => jobsService.listAllJobs(filters) })
}

export function useJobQuery(id) {
  return useQuery({ queryKey: queryKeys.job(id), queryFn: () => jobsService.getJob(id), enabled: !!id })
}

export function useRecommendedJobsQuery() {
  return useQuery({ queryKey: queryKeys.recommendedJobs, queryFn: jobsService.listRecommendedJobs })
}

export function useAppliedBasedJobsQuery() {
  return useQuery({ queryKey: queryKeys.appliedBasedJobs, queryFn: jobsService.listAppliedBasedJobs })
}

export function useInstantHiringJobsQuery() {
  return useQuery({ queryKey: queryKeys.instantHiringJobs, queryFn: jobsService.listInstantHiringJobs })
}
