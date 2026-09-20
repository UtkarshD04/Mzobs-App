// Mandatory "complete your profile" wizard shown right after the one-time payment
// (see screens/ProfileSetupScreen.js). The server re-checks the same fields in
// POST /profile/complete (Backend employeeProfileController.missingProfileFields).

export const STEPS = ['Work', 'Education', 'Personal', 'Location', 'Career', 'Skills']

export const INTEREST_OPTIONS = [
  'Software Development',
  'Data & Analytics',
  'Product Management',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Customer Success',
  'Human Resources',
]
export const LOCATION_SUGGESTIONS = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Lucknow', 'Remote']
export const SKILL_SUGGESTIONS = ['MS Excel', 'SQL', 'Data Analysis', 'Communication', 'Python', 'Sales']
export const NOTICE_OPTIONS = ['Immediate', '15 days', '30 days', '60 days', '90 days']
export const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say']
export const MARITAL_OPTIONS = ['Single', 'Married', 'Prefer not to say']
export const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => `${i} ${i === 1 ? 'year' : 'years'}`)
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => `${i} ${i === 1 ? 'month' : 'months'}`)
export const SALARY_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 15, 20, 25].map((n) => `₹${n}L – ₹${n + 2}L`)

export const EMPTY_FORM = {
  experience: 'fresher',
  currentCompany: '',
  designation: '',
  years: '0 years',
  months: '0 months',
  currentCtc: '',
  noticePeriod: '30 days',
  degree: '',
  institute: '',
  year: '',
  dob: '',
  gender: '',
  maritalStatus: '',
  currentCity: '',
  state: '',
  pincode: '',
  relocationOk: true,
  preferredRole: '',
  interests: [],
  preferredLocations: [],
  salary: '',
  skills: [],
  resumeHeadline: '',
  portfolioLink: '',
  linkedin: '',
  github: '',
}

const filled = (v) => String(v ?? '').trim().length > 0
const num = (label) => parseInt(String(label), 10) || 0

// Returns the message for the first thing missing on a step, or '' when it's fine.
export function validateStep(step, f) {
  switch (step) {
    case 0:
      if (f.experience !== 'experienced') return ''
      if (!filled(f.currentCompany) || !filled(f.designation)) return 'Enter your current or latest company and designation.'
      return num(f.years) + num(f.months) > 0 ? '' : 'Select your total experience.'
    case 1:
      return filled(f.degree) && filled(f.institute) && /^\d{4}$/.test(f.year.trim()) ? '' : 'Enter your degree, institute and a 4-digit year of passing.'
    case 2: {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dob.trim()) || Number.isNaN(new Date(f.dob.trim()).getTime())) return 'Enter your date of birth as YYYY-MM-DD.'
      return f.gender ? '' : 'Select your gender.'
    }
    case 3:
      if (!filled(f.currentCity) || !filled(f.state)) return 'Enter your current city and state.'
      return /^\d{6}$/.test(f.pincode.trim()) ? '' : 'Enter a valid 6-digit pincode.'
    case 4:
      if (!filled(f.preferredRole)) return 'Enter the role you are targeting.'
      if (!f.interests.length) return 'Pick at least one area you are interested in.'
      return f.preferredLocations.length ? '' : 'Add at least one preferred location.'
    case 5:
      if (!f.skills.length) return 'Add at least one skill.'
      return filled(f.resumeHeadline) ? '' : 'Write a one-line resume headline.'
    default:
      return ''
  }
}

export function buildPayload(f) {
  const experienced = f.experience === 'experienced'
  const salaryMin = f.salary ? Number(f.salary.match(/₹(\d+)L/)?.[1]) * 100000 : null
  return {
    experience: f.experience,
    currentCompany: experienced ? f.currentCompany.trim() : '',
    designation: experienced ? f.designation.trim() : '',
    experienceYears: experienced ? num(f.years) + num(f.months) / 12 : 0,
    currentCtc: experienced ? f.currentCtc.trim() : '',
    noticePeriod: experienced ? f.noticePeriod : '',
    education: [{ degree: f.degree.trim(), institute: f.institute.trim(), year: f.year.trim() }],
    dob: f.dob.trim(),
    gender: f.gender,
    maritalStatus: f.maritalStatus,
    currentCity: f.currentCity.trim(),
    state: f.state.trim(),
    pincode: f.pincode.trim(),
    relocationOk: f.relocationOk,
    preferredRole: f.preferredRole.trim(),
    interests: f.interests,
    preferredLocations: f.preferredLocations,
    expectedSalaryMin: salaryMin,
    expectedSalaryMax: salaryMin == null ? null : salaryMin + 200000,
    skills: f.skills,
    resumeHeadline: f.resumeHeadline.trim(),
    portfolioLink: f.portfolioLink.trim(),
    linkedin: f.linkedin.trim(),
    github: f.github.trim(),
  }
}
