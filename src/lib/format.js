export function fmtSalaryRange(job) {
  if (!job.salaryMin && !job.salaryMax) return ''
  const fmt = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${n}`)
  return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`
}

export function fmtDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN')
}
