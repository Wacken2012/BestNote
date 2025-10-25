import { Router } from 'express'
import path from 'path'
import { filterMemberForViewer } from '../services/PermissionService'

const router = Router()

function loadAdapter(name: string) {
  const vendorDir = path.resolve(__dirname, '..', '..', '..', 'vendor')
  const candidates = [
    path.join(vendorDir, name, 'adapter.js'),
    path.join(vendorDir, name + '.js')
  ]
  for (const p of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore
      const mod = require(p)
      if (mod && (mod.listMembers || mod.listFiles)) return mod
    } catch (e) {
      // ignore missing adapters
    }
  }
  return null
}

router.get('/members', async (req: any, res) => {
  try {
    const vendor = String(req.query.vendor || 'openjverein')
    const adapter = loadAdapter(vendor)
    if (!adapter) return res.status(404).json({ error: 'vendor adapter not found' })

    // viewer information: reuse simple header-based helper from members route
    const viewer = { role: req.header('x-user-role') || 'mitglied', id: req.header('x-user-id') }

    const listFn = adapter.listMembers || adapter.listFiles
    const raw = await listFn()

  const members = (raw || []).map((m: any) => ({ ...m })).map((m: any) => filterMemberForViewer(m, viewer))
    res.json({ ok: true, vendor, members })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'vendor members failed' })
  }
})

export default router
