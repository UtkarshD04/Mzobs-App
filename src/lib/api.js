import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE } from './config'

const TOKEN_KEY = 'mzobs-employee-token'

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
}

export const apiClient = axios.create({ baseURL: API_BASE, timeout: 15000 })

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// AuthContext registers itself here on mount so a 401 from anywhere in the
// app (token expired mid-session, revoked, etc.) can clear state and bounce
// to Login — mirrors the web's RequireAuth redirect, done as an interceptor
// since RN has no route guard to hook into.
let onUnauthorized = null
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only a request that actually carried a session means "session expired". Without this
    // check, logout's own cleanup calls (made after the token is cleared) would 401 again,
    // re-trigger logout, and loop forever.
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      await tokenStore.clear()
      onUnauthorized?.()
    }
    return Promise.reject(error)
  }
)
