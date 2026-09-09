import { jobMatchesCategory } from '../components/home/categoryData'

// Shared between JobListScreen (owns the applied filter state + the filtered
// list) and JobFiltersScreen (the dedicated filter page navigated to from
// it) — kept here so both always agree on bucket definitions and matching.
export const WORK_MODES = ['All', 'Remote', 'Hybrid', 'On-site']

export const EXPERIENCE_BUCKETS = [
  { id: 'any', label: 'Any experience' },
  { id: '0-1', label: '0–1 yrs', test: (j) => (j.experienceMin ?? 0) <= 1 },
  { id: '1-3', label: '1–3 yrs', test: (j) => (j.experienceMin ?? 0) >= 1 && (j.experienceMin ?? 0) <= 3 },
  { id: '3-5', label: '3–5 yrs', test: (j) => (j.experienceMin ?? 0) >= 3 && (j.experienceMin ?? 0) <= 5 },
  { id: '5+', label: '5+ yrs', test: (j) => (j.experienceMin ?? 0) >= 5 },
]

export const SALARY_BUCKETS = [
  { id: 'any', label: 'Any salary' },
  { id: 'lt5', label: 'Up to ₹5L', test: (j) => (j.salaryMax ?? Infinity) <= 500000 },
  { id: '5-10', label: '₹5L – ₹10L', test: (j) => (j.salaryMax ?? 0) >= 500000 && (j.salaryMin ?? 0) <= 1000000 },
  { id: '10+', label: '₹10L+', test: (j) => (j.salaryMax ?? 0) >= 1000000 },
]

export const POSTED_BUCKETS = [
  { id: 'any', label: 'Anytime' },
  { id: '1', label: 'Last 24 hours', days: 1 },
  { id: '3', label: 'Last 3 days', days: 3 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
]

export const DEFAULT_FILTERS = { category: 'all', workMode: 'All', experience: 'any', salary: 'any', jobType: 'any', location: 'any', posted: 'any' }

function daysSince(dateValue) {
  if (!dateValue) return Infinity
  return Math.floor((Date.now() - new Date(dateValue).getTime()) / (1000 * 60 * 60 * 24))
}

export function matchesFilters(job, filters) {
  if (filters.workMode !== 'All' && job.workMode !== filters.workMode) return false
  if (!jobMatchesCategory(job, filters.category)) return false
  if (filters.jobType !== 'any' && job.employmentType !== filters.jobType) return false
  if (filters.location !== 'any' && job.location !== filters.location) return false
  if (filters.experience !== 'any') {
    const bucket = EXPERIENCE_BUCKETS.find((b) => b.id === filters.experience)
    if (bucket?.test && !bucket.test(job)) return false
  }
  if (filters.salary !== 'any') {
    const bucket = SALARY_BUCKETS.find((b) => b.id === filters.salary)
    if (bucket?.test && !bucket.test(job)) return false
  }
  if (filters.posted !== 'any') {
    const bucket = POSTED_BUCKETS.find((b) => b.id === filters.posted)
    if (bucket?.days != null && daysSince(job.postedOn) > bucket.days) return false
  }
  return true
}

// Free-text match against title/company/location/skills — the same
// haystack search JobListScreen's own search bar uses, shared here so
// JobFiltersScreen's live result count and JobListScreen's list agree.
export function matchesQuery(job, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [job.title, job.company, job.location, ...(job.skills ?? [])].join(' ').toLowerCase()
  return haystack.includes(q)
}
