export const mockPermissionService = {
  can(permission: string, roles: string[]) {
    if (roles.includes('admin')) return true
    if (permission === 'upload_piece') return roles.includes('notenwart')
    return false
  }
}
