import { Router, Request, Response } from 'express'
import { fetchCalendar } from '../services/caldavService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const path = String(req.query.path || '')
    const data = await fetchCalendar(path)
    res.setHeader('Content-Type', 'text/calendar')
    res.send(data)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'calendar fetch failed' })
  }
})

export default router
