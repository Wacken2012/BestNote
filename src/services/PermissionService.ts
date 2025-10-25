export enum Role {
  Mitglied = 'mitglied',
  Dirigent = 'dirigent',
  Notenwart = 'notenwart',
  Vorstand = 'vorstand',
  Kassierer = 'kassierer',
  Admin = 'admin',
}

export interface User {
  role: Role
  voice?: string
  isMusician?: boolean
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
  if (!user || !user.role) return false

  switch (user.role) {
    case Role.Mitglied:
      return !!user.voice && user.voice === piece.voice
    case Role.Dirigent:
    case Role.Notenwart:
    case Role.Vorstand:
    case Role.Admin:
      return true
    case Role.Kassierer:
      return !!user.isMusician && !!user.voice && user.voice === piece.voice
    default:
      return false
  }
}

/**
 * Only Notenwart and Admin may upload pieces.
 */
export function canUploadPiece(user: User): boolean {
  if (!user || !user.role) return false
  return user.role === Role.Notenwart || user.role === Role.Admin
}

/**
 * Calendar access for: Mitglied, Dirigent, Notenwart, Vorstand, Kassierer, Admin
 */
export function canAccessCalendar(user: User): boolean {
  if (!user || !user.role) return false
  switch (user.role) {
    case Role.Mitglied:
    case Role.Dirigent:
    case Role.Notenwart:
    case Role.Vorstand:
    case Role.Kassierer:
    case Role.Admin:
      return true
    default:
      return false
  }
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
