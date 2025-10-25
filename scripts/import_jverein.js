#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true })
const schemaPath = path.resolve(__dirname, '../schemas/member.schema.json')
const memberSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const validate = ajv.compile(memberSchema)
const { parseStringPromise } = require('xml2js')

const args = process.argv.slice(2)
const showHelp = args.includes('--help') || args.includes('-h')
const showHelpJson = args.includes('--help=json')
const showVersion = args.includes('--version')
const showExamples = args.includes('--examples')
if (showHelpJson) {
  const helpObj = {
    name: 'import_jverein.js',
    description: 'Import CSV/XML exports from jVerein and validate against schemas/member.schema.json',
    flags: {
      '--dry-run': 'Validate only; do not write the output JSON',
      '--help': 'Show help text',
      '--help=json': 'Show help as JSON',
      '--version': 'Show version',
      '--examples': 'Show examples'
    },
    examples: [
      'node scripts/import_jverein.js members.csv server/data/imported_members.json',
      'node scripts/import_jverein.js members.xml server/data/imported_members.json --dry-run'
    ]
  }
  console.log(JSON.stringify(helpObj, null, 2))
  process.exit(0)
}
if (showHelp) {
  console.log('Usage: import_jverein.js <input.csv|input.xml> <out.json> [--dry-run]')
  console.log('\nFlags:')
  console.log('  --dry-run     Validate only; do not write the output JSON')
  console.log('  --help, -h    Show this help')
  console.log('  --version     Show version')
  console.log('  --examples    Show example commands')
  process.exit(0)
}
if (showVersion) {
  console.log('import_jverein.js v1')
  process.exit(0)
}
if (showExamples) {
  console.log('Examples:')
  console.log('  node scripts/import_jverein.js members.csv server/data/imported_members.json')
  console.log('  node scripts/import_jverein.js members.xml server/data/imported_members.json --dry-run')
  process.exit(0)
}
const inputPath = args[0]
const outPath = args[1]
const dryRun = args.includes('--dry-run')
const report = { skipped: [], invalid: [] }
if (!inputPath || !outPath) {
  console.error('Usage: import_jverein.js <input.csv|xml> <out.json>')
  process.exit(2)
}

function validateRecord(rec) {
  const errors = []
  if (!rec.name || rec.name.trim() === '') errors.push('missing name')
  if (rec.role && typeof rec.role !== 'string') errors.push('invalid role')
  // optional: validate date format
  if (rec.entryDate && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(rec.entryDate)) errors.push('invalid entryDate')
  return errors
}

function parseCsv(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const records = parse(raw, { columns: true, skip_empty_lines: true })
  const out = []
  for (let i = 0; i < records.length; i++) {
    const r = records[i]
  const rawRole = r['Role'] || r['Rolle'] || ''
  const roles = rawRole ? rawRole.split(/[,;|\s]+/).map(s => String(s).trim()).filter(Boolean) : []
  // produce both `roles` (array) and `role` (string) for backward compatibility with schema
  const roleStr = roles.length === 0 ? '' : roles.length === 1 ? roles[0] : roles.join(',')
  const rec = { id: `m${i+1}`, name: r['Name'] || `${r['Vorname'] || ''} ${r['Nachname'] || ''}`.trim(), role: roleStr, entryDate: r['Eintritt'] || r['entryDate'] || '' }
    const errs = validateRecord(rec)
    if (errs.length) {
      const msg = `Record ${i+1} invalid (pre-schema): ${errs.join(', ')}`
      console.error(msg)
      report.skipped.push({ index: i+1, reason: errs.join(', '), raw: r })
      continue
    }
    const ok = validate(rec)
    if (!ok) {
      const reasons = (validate.errors || []).map(e => `${e.instancePath || '/'}: ${e.message}`)
      console.error(`Record ${i+1} failed schema validation: ${reasons.join('; ')}`)
      report.invalid.push({ index: i+1, reasons, raw: r })
      continue
    }
    out.push(rec)
  }
  return out
}

async function parseXml(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = await parseStringPromise(raw)
  // jVerein XML structure varies; try to map common nodes conservatively
  const members = []
  const entries = (parsed && parsed.members && parsed.members.member) || (parsed && parsed.member) || []
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    const name = (e.name && e.name[0]) || (e.Nachname && e.Vorname && `${e.Vorname[0]} ${e.Nachname[0]}`) || ''
    const role = (e.role && e.role[0]) || (e.Rolle && e.Rolle[0]) || ''
    const entryDate = (e.entryDate && e.entryDate[0]) || ''
  const rawRole = (e.role && e.role[0]) || (e.Rolle && e.Rolle[0]) || ''
  const roles = rawRole ? String(rawRole).split(/[,;|\s]+/).map(s => s.trim()).filter(Boolean) : []
  const roleStr = roles.length === 0 ? '' : roles.length === 1 ? roles[0] : roles.join(',')
  const rec = { id: `m${i+1}`, name, role: roleStr, entryDate }
    const errs = validateRecord(rec)
    if (errs.length) {
      console.error(`XML record ${i+1} invalid (pre-schema): ${errs.join(', ')}`)
      report.skipped.push({ index: i+1, reason: errs.join(', '), raw: e })
      continue
    }
    const ok = validate(rec)
    if (!ok) {
      console.error(`XML record ${i+1} failed schema validation:`)
      const reasons = (validate.errors || []).map(err => `${err.instancePath || '/'}: ${err.message}`)
      for (const ve of reasons) {
        console.error(` - ${ve}`)
      }
      report.invalid.push({ index: i+1, reasons, raw: e })
      continue
    }
  members.push(rec)
  }
  return members
}

;(async () => {
  try {
    let out = []
    if (inputPath.endsWith('.csv')) out = parseCsv(inputPath)
    else if (inputPath.endsWith('.xml')) out = await parseXml(inputPath)
    else {
      console.error('Unsupported format — provide .csv or .xml')
      process.exit(2)
    }

    console.log('Imported', out.length, 'valid members')
    const reportDir = path.resolve(__dirname, '../server/data')
    fs.mkdirSync(reportDir, { recursive: true })
    const reportJson = path.join(reportDir, 'import_report.json')
    const reportMd = path.join(reportDir, 'import_report.md')
    const reportObj = { imported: out.length, skipped: report.skipped, invalid: report.invalid }
    fs.writeFileSync(reportJson, JSON.stringify(reportObj, null, 2), 'utf8')
    const mdLines = []
    mdLines.push('# Import Report')
    mdLines.push(`Imported: ${out.length}`)
    mdLines.push('')
    if (report.skipped.length) {
      mdLines.push('## Skipped records')
      for (const s of report.skipped) mdLines.push(`- #${s.index}: ${s.reason}`)
      mdLines.push('')
    }
    if (report.invalid.length) {
      mdLines.push('## Invalid records')
      for (const s of report.invalid) mdLines.push(`- #${s.index}: ${s.reasons.join('; ')}`)
      mdLines.push('')
    }
    fs.writeFileSync(reportMd, mdLines.join('\n'), 'utf8')
    if (!dryRun) {
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
      console.log('Wrote output to', outPath)
    } else {
      console.log('Dry-run mode: no file written')
    }
  } catch (err) {
    console.error('Import failed:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()
