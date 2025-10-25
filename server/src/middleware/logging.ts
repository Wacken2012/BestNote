import { Request, Response, NextFunction } from 'express'

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const sensitive = ['email', 'phone', 'address', 'birthdate', 'membershipNumber']

function redact(obj: any) {
  if (!obj || typeof obj !== 'object') return obj
  const copy: any = Array.isArray(obj) ? [] : {}
  for (const k of Object.keys(obj)) {
    if (sensitive.includes(k)) copy[k] = 'REDACTED'
    else if (obj[k] && typeof obj[k] === 'object') copy[k] = redact(obj[k])
    else copy[k] = obj[k]
  }
  return copy
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (LOG_LEVEL === 'info' || LOG_LEVEL === 'debug') {
    try {
      const payload = { method: req.method, path: req.path, body: redact(req.body), headers: { 'x-user-role': req.header('x-user-role') } }
      console.log('REQ', JSON.stringify(payload))
    } catch (e) { /* ignore logging errors */ }
  }
  // hook into response end to log status
  const oldEnd = res.end
  // @ts-ignore
  res.end = function (...args: any[]) {
    try {
      if (LOG_LEVEL === 'debug') {
        console.log('RESP', req.method, req.path, res.statusCode)
      }
    } catch (e) {}
    // @ts-ignore
    return oldEnd.apply(this, args)
  }
  next()
}
