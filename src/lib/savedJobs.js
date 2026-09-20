import { useSyncExternalStore } from 'react'
import * as SecureStore from 'expo-secure-store'

// Device-local "save for later" list, kept per signed-in account so a second
// account on the same phone never sees (or overwrites) someone else's saves.
// Backed by SecureStore (already a dependency) — its ~2KB-per-value limit is
// why the id list is split across several small keys below.
const KEY_PREFIX = 'mzobs-saved-jobs'
const CHUNK_SIZE = 1500
const MAX_CHUNKS = 40

let ownerId = null
let ids = []
let loaded = false
let loadPromise = null
let writeQueue = Promise.resolve()
const listeners = new Set()

function keyFor(owner, part) {
  return `${KEY_PREFIX}-${String(owner).replace(/[^A-Za-z0-9._-]/g, '_')}-${part}`
}

function emit() {
  listeners.forEach((fn) => fn())
}

async function readIds(owner) {
  try {
    const count = Number(await SecureStore.getItemAsync(keyFor(owner, 'n'))) || 0
    let raw = ''
    for (let i = 0; i < count; i += 1) raw += (await SecureStore.getItemAsync(keyFor(owner, i))) ?? ''
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeIds(owner, list) {
  try {
    const raw = JSON.stringify(list)
    const chunks = []
    for (let i = 0; i < raw.length; i += CHUNK_SIZE) chunks.push(raw.slice(i, i + CHUNK_SIZE))
    const previous = Number(await SecureStore.getItemAsync(keyFor(owner, 'n'))) || 0
    for (let i = 0; i < chunks.length; i += 1) await SecureStore.setItemAsync(keyFor(owner, i), chunks[i])
    await SecureStore.setItemAsync(keyFor(owner, 'n'), String(chunks.length))
    for (let i = chunks.length; i < Math.min(previous, MAX_CHUNKS); i += 1) {
      await SecureStore.deleteItemAsync(keyFor(owner, i))
    }
  } catch {
    // Storage unavailable — the in-memory list still works for this session.
  }
}

// Called by AuthContext whenever the signed-in account changes (null = signed out).
export function setSavedJobsOwner(nextOwner) {
  const next = nextOwner ?? null
  if (next === ownerId) return
  ownerId = next
  ids = []
  loaded = false
  loadPromise = null
  emit()
  if (next !== null) ensureLoaded()
}

function ensureLoaded() {
  if (ownerId === null) return Promise.resolve()
  if (loaded) return Promise.resolve()
  if (!loadPromise) {
    const owner = ownerId
    loadPromise = readIds(owner).then((stored) => {
      if (owner !== ownerId) return
      // Keep anything toggled while the read was in flight.
      ids = [...new Set([...stored, ...ids])]
      loaded = true
      emit()
    })
  }
  return loadPromise
}

export function jobSaveKey(job) {
  return String(job.id ?? `${job.title}::${job.company}`)
}

export async function getSavedJobIds() {
  await ensureLoaded()
  return ids
}

export async function isJobSaved(job) {
  await ensureLoaded()
  return ids.includes(jobSaveKey(job))
}

export async function toggleJobSaved(job) {
  if (ownerId === null) return false
  await ensureLoaded()
  const key = jobSaveKey(job)
  const nowSaved = !ids.includes(key)
  ids = nowSaved ? [...ids, key] : ids.filter((id) => id !== key)
  emit()
  const owner = ownerId
  const snapshot = ids
  writeQueue = writeQueue.then(() => writeIds(owner, snapshot))
  await writeQueue
  return nowSaved
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Live list of saved job keys; null until the stored list has loaded.
export function useSavedJobIds() {
  return useSyncExternalStore(subscribe, () => (loaded ? ids : null))
}

export function useIsJobSaved(job) {
  const list = useSavedJobIds()
  return !!list && list.includes(jobSaveKey(job))
}
