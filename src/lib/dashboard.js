export function profileCompletion(profile) {
  if (!profile) return 0
  const checks = [
    !!profile.resumeHeadline,
    (profile.skills ?? []).length > 0,
    (profile.education ?? []).length > 0,
    !!profile.currentCity,
    profile.resume?.status !== 'none',
    !!(profile.portfolioLink || profile.linkedin),
    !!profile.preferredRole,
    (profile.preferredLocations ?? []).length > 0,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function recentActivity(profile, applications) {
  const items = []
  if (profile?.resume?.uploadedOn) items.push({ text: `Resume v${profile.resume.version} uploaded`, time: profile.resume.uploadedOn, tone: 'navy' })
  if (profile?.resume?.verifiedOn)
    items.push({ text: `Resume verified${profile.resume.reviewer ? ` by ${profile.resume.reviewer}` : ''}`, time: profile.resume.verifiedOn, tone: 'green' })
  ;(applications ?? []).forEach((a) => items.push({ text: `Applied to ${a.job?.title ?? 'a role'}`, time: a.appliedOn, tone: 'navy' }))
  return items
    .filter((i) => i.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5)
}
