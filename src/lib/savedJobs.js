import * as SecureStore from 'expo-secure-store'

const STORAGE_KEY = 'mzobs-saved-jobs'

// Mirrors the website's Website/Landing-Frontend/src/lib/savedJobs.js — a
// device-local "save for later" list, no account/API call needed. Uses
// SecureStore (already a dependency for theme/session storage) instead of
// AsyncStorage so this doesn't add a new native module.
async function readIds() {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeIds(ids) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage unavailable — save silently no-ops.
  }
}

export function jobSaveKey(job) {
  return job.id ?? `${job.title}::${job.company}`
}

export async function isJobSaved(job) {
  const ids = await readIds()
  return ids.includes(jobSaveKey(job))
}

export async function toggleJobSaved(job) {
  const key = jobSaveKey(job)
  const ids = await readIds()
  const next = ids.includes(key) ? ids.filter((id) => id !== key) : [...ids, key]
  await writeIds(next)
  return next.includes(key)
}
