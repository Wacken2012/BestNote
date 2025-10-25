import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import uploadRouter from './routes/upload'
import listRouter from './routes/list'
import calendarRouter from './routes/calendar'
import membersRouter from './routes/members'
import vendorRouter from './routes/vendor'
import devRouter from './routes/dev'
import { jwtAuth } from './middleware/auth'
import { requestLogger } from './middleware/logging'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }))
app.use(express.json())
app.use(requestLogger)
app.use(jwtAuth)

app.use('/api/upload', uploadRouter)
app.use('/api/list', listRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/members', membersRouter)
app.use('/api/vendor', vendorRouter)
if (process.env.NODE_ENV === 'development') {
	app.use('/dev', devRouter)
}

const port = Number(process.env.PORT || 3001)
if (require.main === module) {
	app.listen(port, () => console.log(`Server running on http://localhost:${port}`))
}

export default app
