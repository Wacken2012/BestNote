#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')
const vendor = path.join(root, 'vendor', 'nextcloud')
if (!fs.existsSync(vendor)) {
  console.error('vendor/nextcloud not found')
  process.exit(2)
}
console.log('vendor/nextcloud exists. Listing top-level:')
console.log(fs.readdirSync(vendor))
process.exit(0)
