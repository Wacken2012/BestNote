import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const script = path.resolve(__dirname, '../../scripts/import_jverein.js')
const out = path.resolve(__dirname, 'fixtures/out.json')

describe('import_jverein', () => {
  it('imports CSV and validates records', () => {
    const csvPath = path.resolve(__dirname, 'fixtures/sample.csv')
    if (fs.existsSync(out)) fs.unlinkSync(out)
    execSync(`node ${script} ${csvPath} ${out}`)
    const result = JSON.parse(fs.readFileSync(out, 'utf8'))
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('name')
  })
})
