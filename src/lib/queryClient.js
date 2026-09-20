import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export const queryKeys = {
  profile: ['profile'],
  resume: ['resume'],
  jobs: (filters) => ['jobs', filters],
  job: (id) => ['jobs', id],
  recommendedJobs: ['jobs', 'recommended'],
  appliedBasedJobs: ['jobs', 'applied-based'],
  instantHiringJobs: ['jobs', 'instant-hiring'],
  hotCities: ['hotCities'],
  applications: ['applications'],
  subscription: ['subscription'],
  notifications: ['notifications'],
  messageThreads: ['messageThreads'],
  supportTickets: ['supportTickets'],
  notificationPreferences: ['notificationPreferences'],
}
