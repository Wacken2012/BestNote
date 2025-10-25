import axios from 'axios'
import { URL } from 'url'
import { XMLParser } from 'fast-xml-parser'

const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || ''
const AUTH_USER = process.env.NEXTCLOUD_USER || ''
const AUTH_PASS = process.env.NEXTCLOUD_PASS || ''

function authHeader() {
  return { Authorization: 'Basic ' + Buffer.from(`${AUTH_USER}:${AUTH_PASS}`).toString('base64') }
}

export async function uploadPiece(folder: string, filename: string, buffer: Buffer, contentType = 'application/octet-stream') {
  if (!NEXTCLOUD_URL) throw new Error('NEXTCLOUD_URL not configured')
  const dest = new URL(`/remote.php/webdav/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`, NEXTCLOUD_URL).toString()
  await axios.put(dest, buffer, {
    headers: { ...authHeader(), 'Content-Type': contentType }
  })
  return { ok: true }
}

export async function listPieces(folder = ''): Promise<Array<{ name: string; href: string; size: number | null; modified: string | null }>> {
  if (!NEXTCLOUD_URL) throw new Error('NEXTCLOUD_URL not configured')
  const dest = new URL(`/remote.php/webdav/${encodeURIComponent(folder)}`, NEXTCLOUD_URL).toString()
  const body = `<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:href/><d:getcontentlength/><d:getlastmodified/></d:prop></d:propfind>`
  const res = await axios.request({
    method: 'PROPFIND',
    url: dest,
    data: body,
    headers: { ...authHeader(), Depth: '1', 'Content-Type': 'application/xml' },
    responseType: 'text'
  })

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const parsed = parser.parse(res.data)

  // Responses may be under any namespace prefix; find the multistatus node by localName
  function findNodeByLocalName(obj: any, localName: string) {
    if (!obj || typeof obj !== 'object') return undefined
    for (const key of Object.keys(obj)) {
      const ln = key.includes(':') ? key.split(':')[1] : key
      if (ln === localName) return obj[key]
    }
    return undefined
  }

  const multistatus = findNodeByLocalName(parsed, 'multistatus')
  const responses = findNodeByLocalName(multistatus, 'response') || []
  const arr = Array.isArray(responses) ? responses : [responses]

  const items = arr.map((r: any) => {
    // href may be under any prefix
    const hrefNode = findNodeByLocalName(r, 'href')
    const href = typeof hrefNode === 'string' ? hrefNode : ''

    const propstat = findNodeByLocalName(r, 'propstat')
    let prop: any = {}
    if (propstat) {
      const first = Array.isArray(propstat) ? propstat[0] : propstat
      prop = findNodeByLocalName(first, 'prop') || {}
    }

    // helper to find a child by local name inside prop
    function propGet(local: string) {
      const val = findNodeByLocalName(prop, local)
      if (val && typeof val === 'object' && '#text' in val) return val['#text']
      return val
    }

    const rawName = decodeURIComponent(href.split('/').filter(Boolean).slice(-1)[0] || folder || '/')
    const sizeRaw = propGet('getcontentlength')
    const size = sizeRaw != null && sizeRaw !== '' ? parseInt(String(sizeRaw), 10) : null
    const modifiedRaw = propGet('getlastmodified')
    let modified: string | null = null
    if (modifiedRaw) {
      const ts = Date.parse(String(modifiedRaw))
      if (!Number.isNaN(ts)) modified = new Date(ts).toISOString()
      else modified = String(modifiedRaw)
    }

    return { name: rawName, href, size, modified }
  })

  // Filter out entries without names (root) or missing href
  return items.filter((i: any) => i.href && i.name !== '')
}
