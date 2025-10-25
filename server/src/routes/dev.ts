import { Router } from 'express'
import { signTestToken } from '../middleware/auth'
import { ipInAnyCidr } from '../lib/net'

const router = Router()

// Only allow in development
router.post('/token', (req, res) => {
  if (process.env.NODE_ENV !== 'development') return res.status(404).json({ error: 'not found' })
  const { id, roles, whitelist } = req.body || {}
  if (!id || !roles) return res.status(400).json({ error: 'id and roles required' })

  // Require whitelist to be configured; only then allow token issuance
  if (!process.env.DEV_TOKEN_WHITELIST) {
    return res.status(403).json({ error: 'forbidden' })
  }

  // Whitelist may contain CIDRs and/or tokens separated by commas
  if (process.env.DEV_TOKEN_WHITELIST) {
    const list = process.env.DEV_TOKEN_WHITELIST.split(',').map(s => s.trim()).filter(Boolean)
    const tokenHeader = req.header('x-dev-token')
    // check tokens in whitelist
    const tokenOk = tokenHeader && list.includes(tokenHeader)
    // check IP in any CIDR in whitelist
    const cidrs = list.filter(s => s.includes('/'))
    const clientIp = (req.ip || req.connection.remoteAddress || '').replace(/^::ffff:/, '')
    const ipOk = cidrs.length > 0 ? ipInAnyCidr(clientIp, cidrs) : false
    if (!tokenOk && !ipOk) return res.status(403).json({ error: 'forbidden' })
  }

  const jwt = signTestToken(String(id), Array.isArray(roles) ? roles : [roles])
  res.json({ ok: true, token: jwt })
})

export default router
