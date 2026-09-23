export const applicationStatusTone = {
  new: 'navy',
  screening: 'amber',
  shortlisted: 'violet',
  shared: 'teal',
  interview: 'gold',
  selected: 'green',
  rejected: 'red',
}

export const resumeStatusTone = {
  none: 'gray',
  pending: 'amber',
  verified: 'green',
  changes: 'gold',
  rejected: 'red',
}

export const interviewStatusTone = {
  Confirmed: 'gold',
  'Awaiting confirmation': 'gold',
  Completed: 'green',
  Cancelled: 'red',
  Rescheduled: 'navy',
}

// Resumes are accepted the moment they're uploaded, so the app says "Uploaded"
// rather than "Verified" (the backend status value stays 'verified').
export function resumeStatusLabel(status = '') {
  return status === 'verified' ? 'Uploaded' : titleCase(status)
}

export function titleCase(value = '') {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
