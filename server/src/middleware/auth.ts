import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export interface Viewer { id?: string; roles?: string[] }

declare module 'express-serve-static-core' {
  interface Request {
    viewer?: Viewer
  }
}

export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization')
  if (!auth || !auth.startsWith('Bearer ')) { return next() }
  const token = auth.substring(7)
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET)
    req.viewer = { id: decoded.id, roles: decoded.roles || [] }
  } catch (e) {
    console.warn('JWT verify failed:', (e as Error).message)
  }
  return next()
}

export function signTestToken(id: string, roles: string[]) {
  const JWT_SECRET_LOCAL = process.env.JWT_SECRET || 'dev-secret'
  return jwt.sign({ id, roles }, JWT_SECRET_LOCAL, { expiresIn: '7d' })
}
