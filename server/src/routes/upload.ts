import { Router } from 'express'
import multer from 'multer'
import { uploadPiece } from '../services/webdavService'

const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'no file' })
    const folder = req.body.folder || 'Noten'
    await uploadPiece(folder, file.originalname, file.buffer, file.mimetype)
    res.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'upload failed' })
  }
})

export default router
