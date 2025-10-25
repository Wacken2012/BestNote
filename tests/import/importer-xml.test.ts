import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'

const script = path.resolve(__dirname, '../../scripts/import_jverein.js')

describe('import_jverein XML dry-run', () => {
  it('parses XML and validates with schema (dry-run)', () => {
    const xmlPath = path.resolve(__dirname, 'fixtures/sample_jverein.xml')
    const out = path.resolve(__dirname, 'fixtures/out_xml.json')
    const res = execFileSync(process.execPath, [script, xmlPath, out, '--dry-run'], { encoding: 'utf8' })
    expect(res).toContain('Imported')
    expect(res).toContain('Dry-run mode')
  })
})
