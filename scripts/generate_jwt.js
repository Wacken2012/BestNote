#!/usr/bin/env node
const { signTestToken } = require('../server/dist/middleware/auth')
// This script requires the server to be built (tsc) so that server/dist exists.
const args = process.argv.slice(2)
const id = args[0] || 'L1'
const roles = (args[1] || 'admin').split(',')
if (!signTestToken) {
  console.error('Please build the server first: (cd server && npm run build)')
  process.exit(2)
}
console.log(signTestToken(id, roles))
