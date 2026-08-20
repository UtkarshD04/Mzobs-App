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
  applications: ['applications'],
  mockInterview: ['mockInterview'],
  interviews: ['interviews'],
  subscription: ['subscription'],
  notifications: ['notifications'],
  messageThreads: ['messageThreads'],
  threadMessages: (id) => ['messageThreads', id, 'messages'],
}
