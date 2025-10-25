// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import devRouter from '../server/src/routes/dev'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/dev', devRouter)
  return app
}

describe('Dev token endpoint', () => {
  const OLD_ENV = process.env.NODE_ENV
  beforeAll(() => { process.env.NODE_ENV = 'development' })
  afterAll(() => { process.env.NODE_ENV = OLD_ENV })

  it('denies when no whitelist and no header', async () => {
    delete process.env.DEV_TOKEN_WHITELIST
    const app = createApp()
    const res = await request(app).post('/dev/token').send({ id: '1', roles: ['admin'] })
    expect(res.status).toBe(403)
  })

  it('allows with x-dev-token in whitelist', async () => {
    process.env.DEV_TOKEN_WHITELIST = 'secrettoken'
    const app = createApp()
    const res = await request(app).post('/dev/token').set('x-dev-token', 'secrettoken').send({ id: '2', roles: ['admin'] })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  it('allows when client IP in CIDR whitelist', async () => {
    process.env.DEV_TOKEN_WHITELIST = '127.0.0.1/32'
    const app = createApp()
    const res = await request(app).post('/dev/token').send({ id: '3', roles: ['mitglied'] })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })
})
