// Home-tab category filter: maps onto Job.track (a real backend enum — see
// Backend/src/models/Job.js) where possible, and falls back to keyword
// matching against title/department/skills for categories track doesn't
// cover (Finance, Freshers) or when a job's track is blank.
// `tone` selects a tint/dot pair from theme/colors.js (e.g. tone 'teal' ->
// colors.teal + colors.tealTint) so each category tile in the "Browse by
// category" grid reads as a distinct but cohesive colour, purely decorative.
export const CATEGORIES = [
  { id: 'all', label: 'All jobs', icon: 'grid', tone: 'navy' },
  {
    id: 'technology',
    label: 'Technology',
    icon: 'cpu',
    track: 'tech',
    tone: 'teal',
    keywords: ['tech', 'developer', 'engineer', 'software', 'sde', 'programmer', 'data', 'cloud', 'devops', 'qa'],
  },
  { id: 'sales', label: 'Sales', icon: 'trending-up', track: 'sales', tone: 'green', keywords: ['sales', 'business development'] },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'target',
    track: 'marketing',
    tone: 'violet',
    keywords: ['marketing', 'seo', 'content', 'brand', 'social media'],
  },
  { id: 'design', label: 'Design', icon: 'pen-tool', track: 'design', tone: 'gold', keywords: ['design', 'ui', 'ux', 'graphic'] },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'dollar-sign',
    tone: 'amber',
    keywords: ['finance', 'account', 'tax', 'audit', 'payroll', 'bookkeep'],
  },
  { id: 'hr', label: 'HR', icon: 'users', track: 'hr', tone: 'teal', keywords: ['hr', 'human resource', 'recruit', 'talent'] },
  {
    id: 'operations',
    label: 'Operations',
    icon: 'settings',
    track: 'ops',
    tone: 'navy',
    keywords: ['operations', 'logistics', 'supply chain'],
  },
  {
    id: 'support',
    label: 'Support',
    icon: 'headphones',
    track: 'support',
    tone: 'violet',
    keywords: ['support', 'customer service', 'helpdesk'],
  },
  {
    id: 'freshers',
    label: 'Freshers',
    icon: 'award',
    tone: 'gold',
    match: (job) => (job.experienceMin ?? 0) === 0 || /fresher|trainee|graduate|intern/i.test(job.title ?? ''),
  },
  { id: 'remote', label: 'Remote', icon: 'globe', tone: 'green', match: (job) => job.workMode === 'Remote' },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

// Compact subset shown as quick chips right under the search bar.
export const QUICK_CHIP_IDS = ['all', 'remote', 'technology', 'sales', 'marketing', 'hr', 'freshers']

// Full browse grid, in product-spec order (All prepended as the reset tile).
export const GRID_CATEGORY_IDS = [
  'all',
  'technology',
  'sales',
  'marketing',
  'design',
  'finance',
  'hr',
  'operations',
  'support',
  'freshers',
  'remote',
]

export function jobMatchesCategory(job, categoryId) {
  if (!categoryId || categoryId === 'all') return true
  const category = CATEGORY_BY_ID[categoryId]
  if (!category) return true
  if (category.match) return category.match(job)
  if (category.track && job.track && job.track === category.track) return true
  const haystack = `${job.title ?? ''} ${job.department ?? ''} ${(job.skills ?? []).join(' ')}`.toLowerCase()
  return (category.keywords ?? []).some((kw) => haystack.includes(kw))
}
