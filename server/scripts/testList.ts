import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const API = process.env.SERVER_API || 'http://localhost:3001'

const args = process.argv.slice(2)
const mock = args.includes('--mock') || args.includes('-m')
// parse --out <file>
let outFile: string | null = null
const outIndex = args.findIndex(a => a === '--out')
if (outIndex >= 0 && args.length > outIndex + 1) outFile = args[outIndex + 1]

import fs from 'fs'

function writeOutput(items: any[], file?: string) {
  if (!file) return
  const lower = file.toLowerCase()
  try {
    if (lower.endsWith('.json')) {
      fs.writeFileSync(file, JSON.stringify(items, null, 2), { encoding: 'utf8' })
      console.log(`Daten gespeichert in ${file}`)
    } else if (lower.endsWith('.csv')) {
      // simple CSV: header + rows
      const header = ['name', 'href', 'size', 'modified']
      const rows = items.map(i => header.map(h => String(i[h as keyof typeof i] ?? '')).join(','))
      const csv = [header.join(','), ...rows].join('\n')
      fs.writeFileSync(file, csv, { encoding: 'utf8' })
      console.log(`Daten (CSV) gespeichert in ${file}`)
    } else {
      console.error('Ungültige Dateiendung für --out. Unterstützt: .json, .csv')
    }
  } catch (err: any) {
    console.error('Fehler beim Schreiben der Datei:', err.message || err)
  }
}

async function runReal() {
  try {
    const url = `${API}/api/list`
    console.log(`Calling ${url} ...`)
    const res = await axios.get(url, { timeout: 10000 })
    if (res.data && Array.isArray(res.data.items)) {
      console.log('Received items:')
      console.table(res.data.items.map((i: any) => ({ name: i.name, href: i.href, size: i.size, modified: i.modified })))
    } else {
      console.log('Response body:', res.data)
    }
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Fehler: Verbindung zum Backend http://localhost:3001 fehlgeschlagen. Ist der Server gestartet?')
      return process.exit(1)
    }
    if (err.response) {
      console.error('Server returned an error:', err.response.status, err.response.data)
      if (err.response.status === 401) console.error('Auth-Fehler: Prüfe NEXTCLOUD_USER / NEXTCLOUD_PASS in deiner .env')
      return process.exit(1)
    }
    console.error('Unbekannter Fehler:', err.message || err)
    return process.exit(1)
  }
}

function runMock() {
  const items = [
    {
      name: 'Ode an die Freude.pdf',
      href: '/remote.php/dav/files/user/Noten/Ode%20an%20die%20Freude.pdf',
      size: 123456,
      modified: '2025-10-24T18:00:00Z'
    },
    {
      name: 'Te Deum.pdf',
      href: '/remote.php/dav/files/user/Noten/Te%20Deum.pdf',
      size: 98765,
      modified: '2025-10-20T14:30:00Z'
    }
  ]
  console.log('Mock mode — example items:')
  console.table(items)
  if (outFile) writeOutput(items, outFile)
}

if (mock) runMock()
else {
  // Warn if common NEXTCLOUD env vars are missing; still attempt the real call so SERVER_API can point to a mock backend
  const missing = []
  if (!process.env.NEXTCLOUD_URL) missing.push('NEXTCLOUD_URL')
  if (!process.env.NEXTCLOUD_USER) missing.push('NEXTCLOUD_USER')
  if (!process.env.NEXTCLOUD_PASS) missing.push('NEXTCLOUD_PASS')
  if (missing.length) {
    console.warn(`Warnung: Die folgenden Umgebungsvariablen sind nicht gesetzt: ${missing.join(', ')}.\nFalls du gegen Nextcloud testen willst, lege eine .env mit NEXTCLOUD_URL, NEXTCLOUD_USER und NEXTCLOUD_PASS an.`)
  }
  // Wrap runReal to capture and optionally write output
  (async () => {
    try {
      const url = `${API}/api/list`
      console.log(`Calling ${url} ...`)
      const res = await axios.get(url, { timeout: 10000 })
      if (res.data && Array.isArray(res.data.items)) {
        console.log('Received items:')
        console.table(res.data.items.map((i: any) => ({ name: i.name, href: i.href, size: i.size, modified: i.modified })))
        if (outFile) writeOutput(res.data.items, outFile)
      } else {
        console.log('Response body:', res.data)
      }
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED') {
        console.error('Fehler: Verbindung zum Backend http://localhost:3001 fehlgeschlagen. Ist der Server gestartet?')
        return process.exit(1)
      }
      if (err.response) {
        console.error('Server returned an error:', err.response.status, err.response.data)
        if (err.response.status === 401) console.error('Auth-Fehler: Prüfe NEXTCLOUD_USER / NEXTCLOUD_PASS in deiner .env')
        return process.exit(1)
      }
      console.error('Unbekannter Fehler:', err.message || err)
      return process.exit(1)
    }
  })()
}
