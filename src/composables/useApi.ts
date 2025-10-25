import { useAuthStore } from '../store/auth'

export function useApi() {
  const auth = useAuthStore()

  async function request(path: string, opts: RequestInit = {}) {
    const headers = new Headers(opts.headers || {})
    if (auth.token) headers.set('Authorization', `Bearer ${auth.token}`)
    headers.set('Accept', 'application/json')
    if (opts.body && !(opts.body instanceof FormData)) headers.set('Content-Type', 'application/json')
    try {
      const res = await fetch(path, { ...opts, headers })
      if (res.status === 401) {
        // unauthorized - clear token
        auth.clear()
        throw new Error('Unauthorized')
      }
      if (res.status === 403) throw new Error('Forbidden')
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) return await res.json()
      return await res.text()
    } catch (e: any) {
      // network or parsing error
      throw e
    }
  }

  return { request }
}
