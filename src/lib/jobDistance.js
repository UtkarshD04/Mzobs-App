// "Near me" sorting for the job list — mirrors Backend/src/utils/geo.js's
// city table exactly (HOT_CITIES + EXTRA_CITIES: same cities, same coordinates) since
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
  { match: /surat/i, lat: 21.1702, lng: 72.8311 }, // Surat
  { match: /nagpur/i, lat: 21.1458, lng: 79.0882 }, // Nagpur
  { match: /visakhapatnam|vizag/i, lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
  { match: /vadodara|baroda/i, lat: 22.3072, lng: 73.1812 }, // Vadodara
  { match: /patna/i, lat: 25.5941, lng: 85.1376 }, // Patna
  { match: /ranchi/i, lat: 23.3441, lng: 85.3096 }, // Ranchi
  { match: /coimbatore/i, lat: 11.0168, lng: 76.9558 }, // Coimbatore
  { match: /thiruvananthapuram|trivandrum/i, lat: 8.5241, lng: 76.9366 }, // Thiruvananthapuram
  { match: /mysuru|mysore/i, lat: 12.2958, lng: 76.6394 }, // Mysuru
  { match: /mangaluru|mangalore/i, lat: 12.9141, lng: 74.856 }, // Mangaluru
  { match: /nashik/i, lat: 19.9975, lng: 73.7898 }, // Nashik
  { match: /kanpur/i, lat: 26.4499, lng: 80.3319 }, // Kanpur
  { match: /varanasi|banaras/i, lat: 25.3176, lng: 82.9739 }, // Varanasi
  { match: /prayagraj|allahabad/i, lat: 25.4358, lng: 81.8463 }, // Prayagraj
  { match: /\bagra\b/i, lat: 27.1767, lng: 78.0081 }, // Agra
  { match: /meerut/i, lat: 28.9845, lng: 77.7064 }, // Meerut
  { match: /ghaziabad/i, lat: 28.6692, lng: 77.4538 }, // Ghaziabad
  { match: /faridabad/i, lat: 28.4089, lng: 77.3178 }, // Faridabad
  { match: /dehradun/i, lat: 30.3165, lng: 78.0322 }, // Dehradun
  { match: /amritsar/i, lat: 31.634, lng: 74.8723 }, // Amritsar
  { match: /ludhiana/i, lat: 30.901, lng: 75.8573 }, // Ludhiana
  { match: /jalandhar/i, lat: 31.326, lng: 75.5762 }, // Jalandhar
  { match: /jodhpur/i, lat: 26.2389, lng: 73.0243 }, // Jodhpur
  { match: /udaipur/i, lat: 24.5854, lng: 73.7125 }, // Udaipur
  { match: /\bkota\b/i, lat: 25.2138, lng: 75.8648 }, // Kota
  { match: /raipur/i, lat: 21.2514, lng: 81.6296 }, // Raipur
  { match: /bhubaneswar/i, lat: 20.2961, lng: 85.8245 }, // Bhubaneswar
  { match: /guwahati/i, lat: 26.1445, lng: 91.7362 }, // Guwahati
  { match: /vijayawada/i, lat: 16.5062, lng: 80.648 }, // Vijayawada
  { match: /madurai/i, lat: 9.9252, lng: 78.1198 }, // Madurai
  { match: /tiruchirappalli|trichy/i, lat: 10.7905, lng: 78.7047 }, // Tiruchirappalli
  { match: /\bgoa\b|panaji|panjim/i, lat: 15.4909, lng: 73.8278 }, // Goa
  { match: /jamshedpur/i, lat: 22.8046, lng: 86.2029 }, // Jamshedpur
  { match: /gorakhpur/i, lat: 26.7606, lng: 83.3732 }, // Gorakhpur
  { match: /aligarh/i, lat: 27.8974, lng: 78.088 }, // Aligarh
  { match: /bareilly/i, lat: 28.367, lng: 79.4304 }, // Bareilly
  { match: /moradabad/i, lat: 28.8386, lng: 78.7733 }, // Moradabad
  { match: /srinagar/i, lat: 34.0837, lng: 74.7973 }, // Srinagar
  { match: /\bjammu\b/i, lat: 32.7266, lng: 74.857 }, // Jammu
  { match: /shimla/i, lat: 31.1048, lng: 77.1734 }, // Shimla
  { match: /rajkot/i, lat: 22.3039, lng: 70.8022 }, // Rajkot
  { match: /aurangabad/i, lat: 19.8762, lng: 75.3433 }, // Aurangabad
  { match: /\bthane\b/i, lat: 19.2183, lng: 72.9781 }, // Thane
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
