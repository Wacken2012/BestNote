// Minimal adapter shim for vendor/openjverein
// Exports a function to import members from the vendor and a metadata object.

const fs = require('fs')
const path = require('path')

function normalize(member) {
  // Minimal normalization to the server MemberRecord shape
  return {
    id: member.id || member.uuid || member.membershipNumber || member.membership_id || member.Mitgliedsnummer || member.number,
    name: member.name || member.fullName || member.vorname || member.nachname || member.displayName,
    membershipNumber: member.membershipNumber || member.membershipNumber || member.number || undefined,
    email: member.email || member.mail || undefined,
    roles: member.roles || (member.role ? [member.role] : undefined),
    ...member
  }
}

async function readFallback() {
  // try vendored export files first
  const base = path.join(__dirname)
  const candidates = [
    path.join(base, 'export.json'),
    path.join(base, 'data', 'export.json'),
    path.join(base, 'data', 'members.json'),
    path.join(base, '..', 'server', 'data', 'imported_members.json'),
    path.join(base, '..', 'server', 'data', 'seed.json')
  ]
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue
      const raw = fs.readFileSync(p, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
      if (parsed && Array.isArray(parsed.members)) return parsed.members
      if (parsed && Array.isArray(parsed.data)) return parsed.data
    } catch (e) {
      // ignore and continue
    }
  }
  return []
}

const adapter = {
  name: 'openjverein',
  description: 'Adapter for vendored jVerein forks - reads local export files if present',
  async listMembers() {
    const raw = await readFallback()
    return raw.map(normalize)
  },
  async getMemberById(id) {
    if (!id) return null
    const list = await readFallback()
    const found = list.find((m) => String(m.id) === String(id) || String(m.membershipNumber || '') === String(id) || String(m.Mitgliedsnummer || '') === String(id))
    return found ? normalize(found) : null
  }
}

module.exports = adapter
