import { AppState } from 'react-native'
import { QueryClient, focusManager } from '@tanstack/react-query'

// React Query has no idea what "focus" means in React Native — tell it the app coming
// back to the foreground is one, so stale data (new notifications, job status) refreshes
// as soon as the user opens the app.
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (state) => handleFocus(state === 'active'))
  return () => sub.remove()
})

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
