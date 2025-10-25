import fs from 'fs'
import path from 'path'

export enum Role {
  Mitglied = 'mitglied',
  Dirigent = 'dirigent',
  Notenwart = 'notenwart',
  Vorstand = 'vorstand',
  Kassierer = 'kassierer',
  Admin = 'admin',
}

export interface Viewer {
  role: Role | string
  id?: string | number
}

export interface MemberRecord {
  id: string | number
  membershipNumber?: string
  email?: string
  phone?: string
  address?: string
  birthdate?: string
  [key: string]: any
}

export function canViewSensitiveFields(viewer: Viewer | null, target?: MemberRecord): boolean {
  if (!viewer || !viewer.role) return false
  if (String(viewer.role) === Role.Admin) return true
  if (String(viewer.role) === Role.Mitglied && target) {
    if (viewer.id && String(viewer.id) === String(target.id)) return true
    if (viewer.id && target.membershipNumber && String(viewer.id) === String(target.membershipNumber)) return true
  }
  return false
}

export function filterMemberForViewer(member: MemberRecord, viewer: Viewer | null): Partial<MemberRecord> {
  const sensitive = ['email', 'phone', 'address', 'birthdate', 'membershipNumber']
  if (canViewSensitiveFields(viewer, member)) return { ...member }
  const copy: any = { ...member }
  for (const k of sensitive) delete copy[k]
  return copy
}

export function loadDb(): any {
  const dbPath = path.join(__dirname, '..', '..', 'data', 'db.json')
  if (!fs.existsSync(dbPath)) return { members: [] }
  try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')) } catch (e) { return { members: [] } }
}

export function writeDb(db: any) {
  const dbPath = path.join(__dirname, '..', '..', 'data', 'db.json')
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8')
}
