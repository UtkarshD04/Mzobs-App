export function fmtSalaryRange(job, fallback = '') {
  if (!job.salaryMin && !job.salaryMax) return fallback
  const fmt = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${n}`)
  return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`
}

export function fmtExperience(job) {
  if (job.experienceMin == null && job.experienceMax == null) return ''
  if (job.experienceMin === job.experienceMax) return `${job.experienceMin} yr${job.experienceMin === 1 ? '' : 's'}`
  return `${job.experienceMin}-${job.experienceMax} yrs`
}

export function fmtDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN')
}
