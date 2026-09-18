import { useState } from 'react'
import * as Location from 'expo-location'

// Requests foreground location permission and resolves a single fix — used
// by the "Near me" job sort, which only ever needs a one-off coordinate,
// never continuous tracking.
export function useDeviceLocation() {
  const [coords, setCoords] = useState(null)
  const [status, setStatus] = useState('idle') // idle | requesting | granted | denied | error

  // Returns { coords, status } directly (not just via the hook's own state)
  // since a caller awaiting this needs the outcome of THIS call — reading
  // the hook's `status` right after would see a stale, pre-update value.
  async function requestLocation() {
    setStatus('requesting')
    try {
      const { status: permission } = await Location.requestForegroundPermissionsAsync()
      if (permission !== 'granted') {
        setStatus('denied')
        return { coords: null, status: 'denied' }
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const next = { lat: position.coords.latitude, lng: position.coords.longitude }
      setCoords(next)
      setStatus('granted')
      return { coords: next, status: 'granted' }
    } catch {
      setStatus('error')
      return { coords: null, status: 'error' }
    }
  }

  return { coords, status, requestLocation }
}
