import { CATEGORIES, CATEGORY_BY_ID, jobMatchesCategory } from '../components/home/categoryData'

// Naukri-style job filtering, shared by JobListScreen (owns the applied filter
// state, quick chips and the filtered list) and JobFiltersScreen (the full-screen
// filter page): every group is multi-select except experience, freshness and sort,
// and every option can show a live "how many jobs would this give me" count.
//
// All of it runs on-device over the full live job list (see jobsService.listAllJobs).

export const WORK_MODE_OPTIONS = [
  { id: 'On-site', label: 'Work from office' },
  { id: 'Hybrid', label: 'Hybrid' },
  { id: 'Remote', label: 'Remote' },
]

// Annual CTC in rupees. A job matches a band when its [salaryMin, salaryMax]
// overlaps it, so a ₹4–7L job shows up under both "3–6 Lakhs" and "6–10 Lakhs".
export const SALARY_OPTIONS = [
  { id: '0-3', label: '0–3 Lakhs', min: 0, max: 300000 },
  { id: '3-6', label: '3–6 Lakhs', min: 300000, max: 600000 },
  { id: '6-10', label: '6–10 Lakhs', min: 600000, max: 1000000 },
  { id: '10-15', label: '10–15 Lakhs', min: 1000000, max: 1500000 },
  { id: '15+', label: '15 Lakhs & above', min: 1500000, max: Infinity },
]

export const POSTED_OPTIONS = [
  { id: 'any', label: 'Any time' },
  { id: '1', label: 'Last 1 day', days: 1 },
  { id: '3', label: 'Last 3 days', days: 3 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '15', label: 'Last 15 days', days: 15 },
  { id: '30', label: 'Last 30 days', days: 30 },
]

export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'newest', label: 'Date, newest first' },
  { id: 'salary_desc', label: 'Salary, high to low' },
  { id: 'salary_asc', label: 'Salary, low to high' },
]

// Quick experience picks shown under the stepper (any whole number 0–30 works).
export const EXPERIENCE_QUICK_PICKS = [0, 1, 2, 3, 5, 7, 10, 15]
export const MAX_EXPERIENCE = 30

export const DEFAULT_FILTERS = {
  workMode: [],
  category: [],
  experience: null, // "my experience is N years" — jobs whose range includes N
  salary: [],
  jobType: [],
  location: [],
  company: [],
  posted: 'any',
  sort: 'relevance',
}

const MULTI_GROUPS = ['workMode', 'category', 'salary', 'jobType', 'location', 'company']

// Older callers/route params may still hold the previous single-value shape
// (e.g. workMode: 'Remote', category: 'all'); fold anything unexpected back into
// the current shape rather than crashing on `.includes` of a string.
export function normalizeFilters(input) {
  const f = { ...DEFAULT_FILTERS, ...(input ?? {}) }
  for (const key of MULTI_GROUPS) {
    const v = f[key]
    if (Array.isArray(v)) continue
    f[key] = !v || v === 'all' || v === 'All' || v === 'any' ? [] : [v]
  }
  if (typeof f.experience !== 'number' || !Number.isFinite(f.experience)) f.experience = null
  if (!POSTED_OPTIONS.some((o) => o.id === f.posted)) f.posted = 'any'
  if (!SORT_OPTIONS.some((o) => o.id === f.sort)) f.sort = 'relevance'
  return f
}

// ── Keys ────────────────────────────────────────────────────────────────────

// Job.location is free text typed by employers, so "Lucknow", "lucknow " and
// "Lucknow, Uttar Pradesh" all mean the same place. Location filtering compares
// the city part only (before the first comma), trimmed and lower-cased, so they
// collapse into one option instead of three near-duplicate ones.
export function locationKey(location) {
  return String(location ?? '')
    .split(',')[0]
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function companyKey(company) {
  return String(company ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function titleCaseIfShouty(raw) {
  return raw === raw.toLowerCase() || raw === raw.toUpperCase() ? raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : raw
}

function distinctOptions(jobs, keyOf, labelOf) {
  const byKey = new Map()
  for (const job of jobs) {
    const key = keyOf(job)
    if (!key || byKey.has(key)) continue
    byKey.set(key, { id: key, label: labelOf(job) })
  }
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label))
}

// One { id, label } option per distinct city, labelled with the first spelling seen.
export function locationOptions(jobs) {
  return distinctOptions(
    jobs,
    (j) => locationKey(j.location),
    (j) => titleCaseIfShouty(String(j.location).split(',')[0].trim().replace(/\s+/g, ' '))
  )
}

export function companyOptions(jobs) {
  return distinctOptions(
    jobs,
    (j) => companyKey(j.company),
    (j) => String(j.company).trim()
  )
}

export function jobTypeOptions(jobs) {
  return distinctOptions(
    jobs,
    (j) => j.employmentType,
    (j) => j.employmentType
  )
}

// "Department" in the filter UI: the same categories as the Home tab, minus the
// two that aren't departments ("All jobs" is just no filter, "Remote" is a work mode).
export const DEPARTMENT_OPTIONS = CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'remote').map((c) => ({ id: c.id, label: c.label }))

// ── Matching ────────────────────────────────────────────────────────────────

function daysSince(dateValue) {
  if (!dateValue) return Infinity
  return Math.floor((Date.now() - new Date(dateValue).getTime()) / (1000 * 60 * 60 * 24))
}

const MATCHERS = {
  workMode: (job, sel) => !sel.length || sel.includes(job.workMode),
  category: (job, sel) => !sel.length || sel.some((id) => jobMatchesCategory(job, id)),
  jobType: (job, sel) => !sel.length || sel.includes(job.employmentType),
  location: (job, sel) => !sel.length || sel.includes(locationKey(job.location)),
  company: (job, sel) => !sel.length || sel.includes(companyKey(job.company)),
  salary: (job, sel) =>
    !sel.length ||
    sel.some((id) => {
      const band = SALARY_OPTIONS.find((o) => o.id === id)
      if (!band) return true
      // 0-0 means the employer did not disclose pay, so it belongs to no band.
      if (!job.salaryMax && !job.salaryMin) return false
      return (job.salaryMax ?? Infinity) >= band.min && (job.salaryMin ?? 0) <= band.max
    }),
  experience: (job, years) => years == null || ((job.experienceMin ?? 0) <= years && years <= (job.experienceMax ?? Infinity)),
  posted: (job, id) => {
    const option = POSTED_OPTIONS.find((o) => o.id === id)
    return option?.days == null || daysSince(job.postedOn) <= option.days
  },
}

// `exclude` leaves one group out — that's how a facet count is computed: "with
// everything else applied, how many jobs would picking THIS option give me?"
export function matchesFilters(job, filters, exclude) {
  const f = normalizeFilters(filters)
  return Object.keys(MATCHERS).every((key) => key === exclude || MATCHERS[key](job, f[key]))
}

// Free-text match against title/company/location/skills — the same haystack the
// search bar uses, shared so the filter screen's live count and the list agree.
export function matchesQuery(job, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [job.title, job.company, job.location, ...(job.skills ?? [])].join(' ').toLowerCase()
  return haystack.includes(q)
}

// Live count shown next to an option: jobs matching the search, every OTHER group's
// current selection, and this one option.
export function facetCount(jobs, filters, group, optionId, query = '') {
  const f = normalizeFilters(filters)
  const probe = { ...f, [group]: MULTI_GROUPS.includes(group) ? [optionId] : optionId }
  return jobs.reduce((n, job) => (matchesQuery(job, query) && matchesFilters(job, probe) ? n + 1 : n), 0)
}

// ── Sorting ─────────────────────────────────────────────────────────────────

const postedTime = (job) => new Date(job.postedOn ?? 0).getTime()

export function sortJobs(jobs, sort, query = '') {
  const list = [...jobs]
  switch (sort) {
    case 'salary_desc':
      return list.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0) || postedTime(b) - postedTime(a))
    case 'salary_asc':
      return list.sort((a, b) => (a.salaryMin ?? 0) - (b.salaryMin ?? 0) || postedTime(b) - postedTime(a))
    case 'relevance': {
      // With a search term, title hits outrank company/skill/location hits; without
      // one there's nothing to be "relevant" to, so it's simply newest-first.
      const q = query.trim().toLowerCase()
      const score = (job) => (q && String(job.title ?? '').toLowerCase().includes(q) ? 2 : 1)
      return list.sort((a, b) => score(b) - score(a) || postedTime(b) - postedTime(a))
    }
    default:
      return list.sort((a, b) => postedTime(b) - postedTime(a))
  }
}

// ── Applied-filter summary (chips + badges) ─────────────────────────────────

export function activeFilterCount(filters) {
  const f = normalizeFilters(filters)
  return MULTI_GROUPS.reduce((n, key) => n + f[key].length, 0) + (f.experience != null ? 1 : 0) + (f.posted !== 'any' ? 1 : 0)
}

// Number of selections inside one group — the little badge in the filter screen's left rail.
export function groupSelectionCount(filters, group) {
  const f = normalizeFilters(filters)
  if (group === 'experience') return f.experience != null ? 1 : 0
  if (group === 'posted') return f.posted !== 'any' ? 1 : 0
  if (group === 'sort') return f.sort !== 'relevance' ? 1 : 0
  return f[group]?.length ?? 0
}

// One removable chip per applied value: [{ key, group, value, label }].
export function activeFilterChips(filters, jobs = []) {
  const f = normalizeFilters(filters)
  const labelIn = (options, id) => options.find((o) => o.id === id)?.label ?? id
  const locations = locationOptions(jobs)
  const companies = companyOptions(jobs)
  const chips = []
  for (const id of f.workMode) chips.push({ group: 'workMode', value: id, label: labelIn(WORK_MODE_OPTIONS, id) })
  for (const id of f.category) chips.push({ group: 'category', value: id, label: CATEGORY_BY_ID[id]?.label ?? id })
  if (f.experience != null) chips.push({ group: 'experience', value: f.experience, label: `${f.experience} ${f.experience === 1 ? 'yr' : 'yrs'} experience` })
  for (const id of f.salary) chips.push({ group: 'salary', value: id, label: labelIn(SALARY_OPTIONS, id) })
  for (const id of f.jobType) chips.push({ group: 'jobType', value: id, label: id })
  for (const id of f.location) chips.push({ group: 'location', value: id, label: labelIn(locations, id) })
  for (const id of f.company) chips.push({ group: 'company', value: id, label: labelIn(companies, id) })
  if (f.posted !== 'any') chips.push({ group: 'posted', value: f.posted, label: labelIn(POSTED_OPTIONS, f.posted) })
  return chips.map((c) => ({ ...c, key: `${c.group}:${c.value}` }))
}

export function removeFilterValue(filters, group, value) {
  const f = normalizeFilters(filters)
  if (group === 'experience') return { ...f, experience: null }
  if (group === 'posted') return { ...f, posted: 'any' }
  return { ...f, [group]: f[group].filter((v) => v !== value) }
}

export function toggleFilterValue(filters, group, value) {
  const f = normalizeFilters(filters)
  const has = f[group].includes(value)
  return { ...f, [group]: has ? f[group].filter((v) => v !== value) : [...f[group], value] }
}
