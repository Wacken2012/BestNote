/**
 * Placeholder helper for WebDAV access to Nextcloud.
 * Install and configure credentials securely (env, secure store).
 * This file uses the 'webdav' npm package (already in package.json) as a client.
 */
import axios from 'axios'

// Frontend: call the server-side endpoint which performs WebDAV operations
export async function uploadPieceToWebDAV(formData: FormData) {
  // Axios in browser accepts a native FormData
  const resp = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return resp.data
}

export async function listPiecesFromServer() {
  const resp = await axios.get('/api/list')
  return resp.data
}
