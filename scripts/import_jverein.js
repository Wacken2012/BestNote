#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const Ajv = require('ajv')
const ajv = new Ajv({ allErrors: true })

const memberSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    role: { type: 'string' },
    entryDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }
  },
  required: ['id', 'name'],
  additionalProperties: false
}

const validate = ajv.compile(memberSchema)
const { parseStringPromise } = require('xml2js')

const args = process.argv.slice(2)
const inputPath = args[0]
const outPath = args[1]
const dryRun = args.includes('--dry-run')
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
    const rec = { id: `m${i+1}`, name: r['Name'] || `${r['Vorname'] || ''} ${r['Nachname'] || ''}`.trim(), role: r['Role'] || r['Rolle'] || '', entryDate: r['Eintritt'] || r['entryDate'] || '' }
    const errs = validateRecord(rec)
    if (errs.length) {
      console.error(`Record ${i+1} invalid (pre-schema): ${errs.join(', ')}`)
      continue
    }
    const ok = validate(rec)
    if (!ok) {
      console.error(`Record ${i+1} failed schema validation:`)
      for (const e of validate.errors) {
        console.error(` - ${e.instancePath || '/'}: ${e.message}`)
      }
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
    const rec = { id: `m${i+1}`, name, role, entryDate }
    const errs = validateRecord(rec)
    if (errs.length) {
      console.error(`XML record ${i+1} invalid (pre-schema): ${errs.join(', ')}`)
      continue
    }
    const ok = validate(rec)
    if (!ok) {
      console.error(`XML record ${i+1} failed schema validation:`)
      for (const e of validate.errors) {
        console.error(` - ${e.instancePath || '/'}: ${e.message}`)
      }
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
