// "Near me" sorting for the job list — mirrors Backend/src/utils/geo.js's
// city table exactly (same curated cities, same coordinates) since
// Job.location is free text (a city name), not coordinates, so distance is
// computed against known cities rather than per-job geodata.
const CITY_COORDS = [
  { match: /bengaluru|bangalore/i, lat: 12.9716, lng: 77.5946 },
  { match: /mumbai/i, lat: 19.076, lng: 72.8777 },
  { match: /delhi/i, lat: 28.6139, lng: 77.209 },
  { match: /hyderabad/i, lat: 17.385, lng: 78.4867 },
  { match: /pune/i, lat: 18.5204, lng: 73.8567 },
  { match: /chennai/i, lat: 13.0827, lng: 80.2707 },
  { match: /noida/i, lat: 28.5355, lng: 77.391 },
  { match: /gurugram|gurgaon/i, lat: 28.4595, lng: 77.0266 },
  { match: /kolkata|calcutta/i, lat: 22.5726, lng: 88.3639 },
  { match: /lucknow/i, lat: 26.8467, lng: 80.9462 },
  { match: /ahmedabad/i, lat: 23.0225, lng: 72.5714 },
  { match: /jaipur/i, lat: 26.9124, lng: 75.7873 },
  { match: /chandigarh|mohali|panchkula/i, lat: 30.7333, lng: 76.7794 },
  { match: /indore/i, lat: 22.7196, lng: 75.8577 },
  { match: /kochi|cochin/i, lat: 9.9312, lng: 76.2673 },
  { match: /bhopal/i, lat: 23.2599, lng: 77.4126 },
]

function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

// Distance in km from `coords` to the job's location string, or null if it
// doesn't match any known city (sorts last, distance hidden on the card).
export function distanceToJob(job, coords) {
  const city = CITY_COORDS.find((c) => c.match.test(job.location ?? ''))
  return city ? haversineKm(coords, city) : null
}

export function sortJobsByDistance(jobs, coords) {
  return [...jobs].sort((a, b) => {
    const da = distanceToJob(a, coords)
    const db = distanceToJob(b, coords)
    if (da == null && db == null) return 0
    if (da == null) return 1
    if (db == null) return -1
    return da - db
  })
}
