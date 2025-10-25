import { Router } from 'express'
import { loadDb, writeDb, filterMemberForViewer, Role } from '../services/PermissionService'

const router = Router()

// Backup retention: keep last N backups (default 5), can be overridden with env MAX_BACKUPS
const MAX_BACKUPS = Number(process.env.MAX_BACKUPS || 5)

// Simple auth helper: read role and id from headers for demo purposes.
function getViewer(req: any) {
  const role = req.header('x-user-role') || 'mitglied'
  const id = req.header('x-user-id') || undefined
  return { role, id }
}

router.get('/', (req, res) => {
  try {
    const viewer = getViewer(req)
    if (viewer.role !== Role.Admin) return res.status(403).json({ error: 'forbidden' })
    const db = loadDb()
    res.json({ ok: true, members: db.members || [] })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'members list failed' })
  }
})

router.get('/:id', (req, res) => {
  try {
    const db = loadDb()
    const id = req.params.id
    const member = (db.members || []).find((m: any) => String(m.id) === String(id) || String(m.membershipNumber || '') === String(id))
    if (!member) return res.status(404).json({ error: 'not found' })
    const viewer = getViewer(req)
    const filtered = filterMemberForViewer(member, viewer)
    res.json({ ok: true, member: filtered })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'member fetch failed' })
  }
})

router.delete('/:id', (req, res) => {
  try {
    const viewer = getViewer(req)
    if (viewer.role !== Role.Admin) return res.status(403).json({ error: 'forbidden' })
    const db = loadDb()
    const before = (db.members || []).length
    db.members = (db.members || []).filter((m: any) => String(m.id) !== String(req.params.id) && String(m.membershipNumber || '') !== String(req.params.id))
    const after = db.members.length
    writeDb(db)
    res.json({ ok: true, removed: before - after })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'delete failed' })
  }
})

// Import members (supports dry-run via ?dry=true)
router.post('/import', (req, res) => {
  try {
    const viewer = getViewer(req)
    if (viewer.role !== Role.Admin) return res.status(403).json({ error: 'forbidden' })
    const payload = req.body || {}
    const incoming: any[] = Array.isArray(payload.members) ? payload.members : (payload.members || [])
    if (!Array.isArray(incoming)) return res.status(400).json({ error: 'members must be an array' })

    const db = loadDb()
    const existing = db.members || []
    const byId = new Map(existing.map((m: any) => [String(m.id), m]))

    let created = 0
    let updated = 0

    // Simple validation: each member must have an id
    for (const item of incoming) {
      const m: any = item
      if (!m || (!m.id && !m.membershipNumber)) return res.status(400).json({ error: 'each member needs an id or membershipNumber' })
      const idKey = String(m.id || m.membershipNumber)
      if (byId.has(idKey)) {
        updated++
        // merge shallowly
        const target: any = byId.get(idKey)
        Object.assign(target, m)
      } else {
        created++
        existing.push(m)
        byId.set(idKey, m)
      }
    }

    const rawDry = (req.query && (req.query as any).dry)
    const dry = String(rawDry) === 'true'
    if (!dry) {
      // write to imported_members.json for safety (don't overwrite main db)
      const path = require('path')
      const fs = require('fs')
      const dataDir = path.join(__dirname, '..', '..', 'data')
      const outPath = path.join(dataDir, 'imported_members.json')

      // backup behavior: if requested, create timestamped backup by copying existing files
      const wantBackup = Boolean((req.body && (req.body as any).backup))
      if (wantBackup) {
        try {
          const backupsDir = path.join(dataDir, 'backups')
          if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true })
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const importedPath = outPath
          const dbPath = path.join(dataDir, 'db.json')
          let createdBackupPath: string | null = null
          if (fs.existsSync(importedPath)) {
            const dest = path.join(backupsDir, `imported_members.backup.${timestamp}.json`)
            fs.copyFileSync(importedPath, dest)
            createdBackupPath = dest
          } else if (fs.existsSync(dbPath)) {
            const dest = path.join(backupsDir, `db.backup.${timestamp}.json`)
            fs.copyFileSync(dbPath, dest)
            createdBackupPath = dest
          } else {
            // fallback: write snapshot of current members
            const dest = path.join(backupsDir, `members_snapshot.backup.${timestamp}.json`)
            fs.writeFileSync(dest, JSON.stringify(existing, null, 2) + '\n', 'utf8')
            createdBackupPath = dest
          }

          // retention: keep only the last MAX_BACKUPS files (sorted by filename which contains the timestamp)
          try {
            const all: { name: string, path: string }[] = fs.readdirSync(backupsDir).map((f: string) => ({ name: f, path: path.join(backupsDir, f) }))
            // sort ascending by filename (timestamps in filename ensure chronological order)
            all.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
            const excess = all.length - MAX_BACKUPS
            if (excess > 0) {
              const toDelete = all.slice(0, excess)
              for (const d of toDelete) {
                try { fs.unlinkSync(d.path) } catch (e) { /* ignore */ }
              }
            }
          } catch (err) { /* ignore retention errors */ }
        } catch (err) {
          console.error('backup failed', err)
        }
      }

      fs.writeFileSync(outPath, JSON.stringify(existing, null, 2) + '\n', 'utf8')
    }

    res.json({ ok: true, dry: !!dry, created, updated })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'import failed' })
  }
})

export default router

