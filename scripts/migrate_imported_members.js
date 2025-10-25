#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function readJsonSafe(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8')
    if (!raw || !raw.trim()) return null
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(`Failed to read/parse JSON at ${file}: ${err.message}`)
  }
}

const repoRoot = path.resolve(__dirname, '..')
const dataDir = path.join(repoRoot, 'server', 'data')
const importedPath = path.join(dataDir, 'imported_members.json')
const dbPath = path.join(dataDir, 'db.json')
const reportPath = path.join(dataDir, 'migration_report.json')

// CLI flags: --dry-run, --strategy=skip|overwrite, --key=id|name, --confirm, --help, --version
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const autoConfirm = args.includes('--confirm')
const showHelp = args.includes('--help') || args.includes('-h')
const showHelpJson = args.includes('--help=json')
const showVersion = args.includes('--version')
const showExamples = args.includes('--examples')
if (showHelpJson) {
  const helpObj = {
    name: 'migrate_imported_members.js',
    description: 'Merge imported_members.json into db.json with deduplication and backup rotation',
    flags: {
      '--dry-run': 'Validate and report only; do not modify db.json',
      '--strategy=skip|overwrite': 'How to handle duplicates (default: skip)',
      '--key=id|name': 'Which field to use as unique key (default: id)',
      '--confirm': 'Skip interactive confirmation for overwrites',
      '--help': 'Show help text',
      '--help=json': 'Show this help as JSON',
      '--version': 'Show version',
      '--examples': 'Show usage examples'
    },
    examples: [
      'node scripts/migrate_imported_members.js --dry-run',
      'node scripts/migrate_imported_members.js --strategy=overwrite --confirm'
    ]
  }
  console.log(JSON.stringify(helpObj, null, 2))
  process.exit(0)
}
if (showHelp) {
  console.log('Usage: migrate_imported_members.js [--dry-run] [--strategy=skip|overwrite] [--key=id|name] [--confirm]')
  console.log('\nFlags:')
  console.log('  --dry-run     Validate and report only; do not modify db.json')
  console.log('  --strategy    skip|overwrite (default: skip)')
  console.log('  --key         id|name (default: id)')
  console.log('  --confirm     Skip interactive confirmation for overwrites')
  console.log('  --help, -h    Show this help')
  console.log('  --version     Show version')
  console.log('  --examples    Show examples')
  process.exit(0)
}
if (showVersion) {
  console.log('migrate_imported_members.js v1')
  process.exit(0)
}
if (showExamples) {
  console.log('Examples:')
  console.log('  node scripts/migrate_imported_members.js --dry-run')
  console.log('  node scripts/migrate_imported_members.js --strategy=overwrite --confirm')
  process.exit(0)
}
const getArg = (name, fallback) => {
  const p = args.find(a => a.startsWith(`${name}=`))
  if (!p) return fallback
  return p.split('=')[1]
}
const strategy = getArg('--strategy', 'skip')
const key = getArg('--key', 'id')

let imported = []
try {
  const x = readJsonSafe(importedPath)
  imported = Array.isArray(x) ? x : []
} catch (err) {
  console.error(err.message)
  process.exit(2)
}

if (!imported.length) {
  console.error('No imported members found or file empty at', importedPath)
  process.exit(2)
}

let db = { members: [] }
try {
  const x = readJsonSafe(dbPath)
  if (x && Array.isArray(x.members)) db = x
  else if (x && Array.isArray(x)) db = { members: x }
} catch (err) {
  console.warn('Warning: db.json read failed:', err.message)
  console.warn('If db.json is missing or invalid, a new db.json will be created. Consider backing up the file manually: cp server/data/db.json server/data/db.backup.json')
  db = { members: [] }
}

db.members = db.members || []

const report = { added: [], skipped: [], errors: [] }

// Helpers
function normName(n) { return (n || '').toLowerCase().replace(/\s+/g, ' ').trim() }
const existingById = new Map(db.members.filter(Boolean).map(m => [String(m.id), m]))
const existingByName = new Map(db.members.filter(Boolean).map(m => [normName(m.name), m]))

// backup rotation: keep backups in server/data/backups/db.backup.<timestamp>.json (max 5)
const backupsDir = path.join(dataDir, 'backups')
try {
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true })
} catch (err) {
  console.warn('Failed to ensure backups directory', backupsDir, err && err.message)
}
let backupFile = null
try {
  if (fs.existsSync(dbPath)) {
    const ts = Date.now()
    backupFile = path.join(backupsDir, `db.backup.${ts}.json`)
    fs.copyFileSync(dbPath, backupFile)
    console.log('Backup of db.json created at', backupFile)
    // prune old backups, keep max 5
    const files = fs.readdirSync(backupsDir).filter(f => f.startsWith('db.backup.') && f.endsWith('.json'))
    const sorted = files.sort((a, b) => {
      const ta = Number(a.replace(/[^0-9]/g, '')) || 0
      const tb = Number(b.replace(/[^0-9]/g, '')) || 0
      return ta - tb
    })
    if (sorted.length > 5) {
      const toDelete = sorted.slice(0, sorted.length - 5)
      for (const d of toDelete) {
        try { fs.unlinkSync(path.join(backupsDir, d)) } catch (e) { /* ignore */ }
        console.log('Removed old backup', d)
      }
    }
  }
} catch (err) {
  console.warn('Failed to create or rotate backups:', err && err.message)
}

;(async () => {
  // If overwrite strategy is selected, detect potential overwrites first
  let potentialOverwrites = []
  for (const rec of imported) {
    const keyVal = key === 'name' ? normName(rec.name) : rec.id
    if (keyVal) {
      if (key === 'id' && existingById.has(keyVal)) potentialOverwrites.push({ type: 'id', rec })
      if (key === 'name' && existingByName.has(keyVal)) potentialOverwrites.push({ type: 'name', rec })
    }
  }

  if (strategy === 'overwrite' && potentialOverwrites.length && !autoConfirm) {
    // ask user
    const readline = require('readline')
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const ans = await new Promise(resolve => rl.question(`About to overwrite ${potentialOverwrites.length} existing records. Proceed? (y/N) `, a => { rl.close(); resolve(a) }))
    if (!String(ans).toLowerCase().startsWith('y')) {
      console.log('Aborted by user')
      process.exit(0)
    }
  }

  for (const rec of imported) {
    try {
    const keyVal = key === 'name' ? normName(rec.name) : String(rec.id)
    if (keyVal && key === 'id' && existingById.has(String(keyVal))) {
      if (strategy === 'skip') {
        report.skipped.push({ reason: 'duplicate id', id: rec.id })
        continue
      } else if (strategy === 'overwrite') {
        // replace existing
        const existing = existingById.get(String(keyVal))
        Object.assign(existing, rec)
        report.added.push({ id: rec.id, name: rec.name, overwritten: true })
        continue
      }
    }
    if (keyVal && key === 'name' && existingByName.has(keyVal)) {
      if (strategy === 'skip') {
        report.skipped.push({ reason: 'duplicate name', name: rec.name })
        continue
      } else if (strategy === 'overwrite') {
        const existing = existingByName.get(keyVal)
        Object.assign(existing, rec)
        report.added.push({ id: existing.id || rec.id, name: rec.name, overwritten: true })
        continue
      }
    }
    // normalize roles: if a comma-separated role string is present, convert to array
    if (rec.role && !rec.roles) {
      rec.roles = String(rec.role).split(/[,;|\s]+/).map(s => s.trim()).filter(Boolean)
      delete rec.role
    }
    // new record: ensure id
    if (!rec.id) rec.id = `m${Date.now()}${Math.floor(Math.random()*1000)}`
    db.members.push(rec)
    existingById.set(rec.id, rec)
    existingByName.set(normName(rec.name), rec)
    report.added.push({ id: rec.id, name: rec.name })
  } catch (err) {
    report.errors.push({ rec, error: err.message })
  }
}

// write report
try {
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
} catch (err) {
  console.error('Failed to write migration report at', reportPath, err.message)
}

if (!dryRun) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8')
    console.log('Wrote updated db.json to', dbPath)
  } catch (err) {
    console.error('Failed to write db.json:', err.message)
    console.error('Your backup is at', backupPath)
    process.exit(1)
  }
} else {
  console.log('Dry-run mode: db.json not modified. Backup at', backupPath)
}

console.log('Migration complete. Added:', report.added.length, 'Skipped:', report.skipped.length)
  if (report.errors.length) console.warn('Errors during migration:', report.errors.length)

  // end async IIFE
})()
