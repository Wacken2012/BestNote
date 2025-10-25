#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const csv = require('csv-parse/lib/sync')

const [,, inputPath, outPath] = process.argv
if (!inputPath || !outPath) {
  console.error('Usage: import_jverein.js <input.csv|xml> <out.json>')
  process.exit(2)
}

function parseCsv(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const records = csv(raw, { columns: true, skip_empty_lines: true })
  return records.map((r, i) => ({ id: `m${i+1}`, name: r['Name'] || r['Vorname'] + ' ' + r['Nachname'], raw: r }))
}

function parseXml(file) {
  // minimal xml parse fallback
  const raw = fs.readFileSync(file, 'utf8')
  // Not a full XML parser here — recommend using a proper xml2js in real setups
  return [{ id: 'm1', name: raw.substring(0, 40) }]
}

let out = []
if (inputPath.endsWith('.csv')) out = parseCsv(inputPath)
else if (inputPath.endsWith('.xml')) out = parseXml(inputPath)
else {
  console.error('Unsupported format — provide .csv or .xml')
  process.exit(2)
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
console.log('Imported', out.length, 'members to', outPath)
