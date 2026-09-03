// Mirrors Website/Landing-Frontend's COMPANIES_HIRING_DATA (src/lib/content.js)
// — Mzobs' real logo partners, shown here the same way the landing page does,
// as trust-building "companies hiring now" content rather than a live count
// derived from this environment's job data. Sunsource/Sunsure are excluded —
// they ship only as .svg on the website, which RN can't render without an
// extra native dependency this app doesn't have.
export const COMPANIES_HIRING_DATA = [
  { name: 'AMPIN Energy Transition', logo: require('../../../assets/industry-logos/ampin.png'), industry: 'Renewable Energy', openRoles: 6 },
  { name: 'Amplus Solar', logo: require('../../../assets/industry-logos/amplus.jpg'), industry: 'Solar Energy', openRoles: 4 },
  { name: 'Fourth Partner Energy', logo: require('../../../assets/industry-logos/fourthpartner.png'), industry: 'Clean Energy', openRoles: 9 },
  { name: "Haldiram's", logo: require('../../../assets/industry-logos/haldirams.png'), industry: 'FMCG & Food', openRoles: 12 },
  { name: 'Prakash Steel', logo: require('../../../assets/industry-logos/prakash-steel.png'), industry: 'Steel & Metals', openRoles: 5 },
  { name: 'Rimjhim Ispat', logo: require('../../../assets/industry-logos/rimjhim-ispat.png'), industry: 'Steel & Metals', openRoles: 3 },
]
