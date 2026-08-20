import { apiClient } from '../lib/api'

export function getResume() {
  return apiClient.get('/resume').then((r) => r.data)
}

// `asset` is a DocumentPicker result asset: { uri, name, mimeType }. RN's
// FormData needs a {uri,name,type} object in place of a browser File, but
// the backend's multer field name ("resume") and response shape are identical.
export function uploadResume(asset) {
  const formData = new FormData()
  formData.append('resume', {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType ?? 'application/octet-stream',
  })
  return apiClient.post('/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}
