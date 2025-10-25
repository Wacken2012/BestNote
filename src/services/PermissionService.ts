export enum Role {
  Mitglied = 'mitglied',
  Dirigent = 'dirigent',
  Notenwart = 'notenwart',
  Vorstand = 'vorstand',
  Kassierer = 'kassierer',
  Admin = 'admin',
}

export interface User {
  roles?: Role[]
  // legacy single-role field kept for compatibility
  role?: Role
  voice?: string
  isMusician?: boolean
  id?: string | number
}

// Shape of a stored member record (server db.json)
export interface MemberRecord {
  id: string | number
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
  address?: string
  birthdate?: string
  membershipNumber?: string
  [key: string]: any
}

export interface Piece {
  voice: string
  title: string
}

/**
 * Returns true if the given user can view the piece.
 * Rules:
 * - Mitglied: only their own voice
 * - Dirigent / Notenwart / Vorstand / Admin: all voices
 * - Kassierer: only their own voice, and only if isMusician === true
 */
export function canAccessPiece(piece: Piece, user: User): boolean {
  const roles = getRoles(user)
  if (!user || !roles || roles.length === 0) return false
  if (roles.includes(Role.Admin)) return true
  if (roles.includes(Role.Mitglied)) return !!user.voice && user.voice === piece.voice
  if (roles.includes(Role.Kassierer)) return !!user.isMusician && !!user.voice && user.voice === piece.voice
  if (roles.includes(Role.Dirigent) || roles.includes(Role.Notenwart) || roles.includes(Role.Vorstand)) return true
  return false
}

/**
 * Only Notenwart and Admin may upload pieces.
 */
export function canUploadPiece(user: User): boolean {
  const roles = getRoles(user)
  if (!user || !roles || roles.length === 0) return false
  return roles.includes(Role.Notenwart) || roles.includes(Role.Admin)
}

/**
 * Calendar access for: Mitglied, Dirigent, Notenwart, Vorstand, Kassierer, Admin
 */
export function canAccessCalendar(user: User): boolean {
  const roles = getRoles(user)
  if (!user || !roles || roles.length === 0) return false
  return [Role.Mitglied, Role.Dirigent, Role.Notenwart, Role.Vorstand, Role.Kassierer, Role.Admin].some(r => roles.includes(r))
}

/**
 * Minimal generic permission check used by template directives.
 * This is intentionally small and conservative: Admin always wins, otherwise
 * check a few common permission strings against roles.
 */
export function can(permission: string, roles?: Role[]): boolean {
  if (!roles || roles.length === 0) return false
  if (roles.includes(Role.Admin)) return true

  switch (permission) {
    case 'add_piece':
    case 'upload_piece':
    case 'add_piece_modal':
    case 'create_setlist':
      return roles.includes(Role.Notenwart) || roles.includes(Role.Dirigent)
    default:
      return false
  }
}

/**
 * Returns true if the viewer (by role) may see/edit sensitive member fields.
 * Admins may see everything. Members may see only their own full record.
 */
export function canViewSensitiveFields(viewer: User | null, targetMember?: MemberRecord): boolean {
  const roles = getRoles(viewer || null)
  if (!viewer || !roles || roles.length === 0) return false
  if (roles.includes(Role.Admin)) return true
  if (roles.includes(Role.Mitglied) && targetMember) {
    if (viewer!.id && targetMember.id && String(viewer!.id) === String(targetMember.id)) return true
    if (viewer!.id && targetMember.membershipNumber && String(viewer!.id) === String(targetMember.membershipNumber)) return true
  }
  return false
}

/**
 * Return a filtered member object depending on the viewer's permissions.
 * Admin: full record, Mitglied: full record only for self, others: redact sensitive fields.
 */
export function filterMemberForViewer(member: MemberRecord, viewer: User | null): Partial<MemberRecord> {
  const sensitive = ['email', 'phone', 'address', 'birthdate', 'membershipNumber']
  if (canViewSensitiveFields(viewer, member)) return { ...member }

  // redact sensitive fields for other viewers
  const copy: any = { ...member }
  for (const k of sensitive) delete copy[k]
  return copy
}

function getRoles(user: User | null): Role[] {
  if (!user) return []
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles
  if ((user as any).role) return [(user as any).role]
  return []
}
