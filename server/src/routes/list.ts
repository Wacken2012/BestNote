import { Router } from 'express'
import { listPieces } from '../services/webdavService'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const items = await listPieces()
    res.json({ ok: true, items })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'list failed' })
  }
})

export default router
