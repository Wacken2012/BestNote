import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import uploadRouter from './routes/upload'
import listRouter from './routes/list'
import calendarRouter from './routes/calendar'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }))
app.use(express.json())

app.use('/api/upload', uploadRouter)
app.use('/api/list', listRouter)
app.use('/api/calendar', calendarRouter)

const port = Number(process.env.PORT || 3001)
app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
