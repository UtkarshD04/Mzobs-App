// How complete a profile really is: every item below is checked against the actual saved
// data (nothing is estimated or animated), so the percentage only rises when a real detail
// is added. The profile-setup wizard runs the same function over the answers typed so far.
export const COMPLETION_CHECKS = [
  { key: 'resumeHeadline', label: 'Resume headline', test: (p) => !!String(p.resumeHeadline ?? '').trim() },
  { key: 'skills', label: 'Skills', test: (p) => (p.skills ?? []).length > 0 },
  { key: 'education', label: 'Education', test: (p) => (p.education ?? []).some((e) => !!String(e?.degree ?? '').trim()) },
  { key: 'location', label: 'City, state and pincode', test: (p) => !!(p.currentCity && p.state && p.pincode) },
  { key: 'personal', label: 'Date of birth and gender', test: (p) => !!(p.dob && p.gender) },
  { key: 'phone', label: 'Verified mobile number', test: (p) => !!p.phoneVerified },
  { key: 'resume', label: 'Resume upload', test: (p) => !!p.resume && p.resume.status !== 'none' },
  { key: 'links', label: 'Portfolio or LinkedIn link', test: (p) => !!(p.portfolioLink || p.linkedin) },
  { key: 'preferredRole', label: 'Preferred role', test: (p) => !!String(p.preferredRole ?? '').trim() },
  { key: 'preferredLocations', label: 'Preferred locations', test: (p) => (p.preferredLocations ?? []).length > 0 },
  { key: 'interests', label: 'Areas of interest', test: (p) => (p.interests ?? []).length > 0 },
]

export function profileCompletionDetail(profile) {
  if (!profile) return { percent: 0, missing: COMPLETION_CHECKS }
  const missing = COMPLETION_CHECKS.filter((c) => !c.test(profile))
  return { percent: Math.round(((COMPLETION_CHECKS.length - missing.length) / COMPLETION_CHECKS.length) * 100), missing }
}

export function profileCompletion(profile) {
  return profileCompletionDetail(profile).percent
}

export function recentActivity(profile, applications) {
  const items = []
  if (profile?.resume?.uploadedOn) items.push({ text: `Resume v${profile.resume.version} uploaded`, time: profile.resume.uploadedOn, tone: 'navy' })
  if (profile?.resume?.verifiedOn)
    items.push({ text: `Resume verified${profile.resume.reviewer ? ` by ${profile.resume.reviewer}` : ''}`, time: profile.resume.verifiedOn, tone: 'green' })
  if (profile?.skillTrack?.assignedOn)
    items.push({
      text: `Skill track assigned — ${profile.skillTrack.label || profile.skillTrack.key}, Grade ${profile.skillTrack.grade || '-'}`,
      time: profile.skillTrack.assignedOn,
      tone: 'gold',
    })
  ;(applications ?? []).forEach((a) => items.push({ text: `Applied to ${a.job?.title ?? 'a role'}`, time: a.appliedOn, tone: 'navy' }))
  return items
    .filter((i) => i.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5)
}
