const fs = require('fs')
const path = require('path')

function normalizeToMember(fileMeta) {
  // Nextcloud adapter can't magically produce member records; attempt minimal mapping
  return {
    id: fileMeta.id || fileMeta.name,
    name: fileMeta.name || fileMeta.filename,
    file: fileMeta.path || fileMeta.filename || undefined,
    raw: fileMeta
  }
}

async function readExport() {
  const base = path.join(__dirname)
  const candidates = [
    path.join(base, 'export.json'),
    path.join(base, 'data', 'export.json'),
    path.join(base, '..', 'server', 'data', 'imported_members.json')
  ]
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue
      const raw = fs.readFileSync(p, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
      if (parsed && Array.isArray(parsed.files)) return parsed.files
    } catch (e) {}
  }
  return []
}

const adapter = {
  name: 'nextcloud',
  description: 'Adapter for vendored Nextcloud exports (local files)',
  async listMembers() {
    const data = await readExport()
    return data.map(normalizeToMember)
  },
  async getMemberById(id) {
    const list = await readExport()
    const found = list.find((f) => String(f.id) === String(id) || String(f.name) === String(id))
    return found ? normalizeToMember(found) : null
  }
}

module.exports = adapter
