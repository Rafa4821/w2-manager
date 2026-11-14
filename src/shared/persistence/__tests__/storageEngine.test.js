import { describe, it, expect, beforeEach } from 'vitest'
import { loadStore, saveStore, getCollection, saveCollection, exportBackup, importBackup, clearAllData, getStorageInfo } from '../storageEngine'

beforeEach(() => {
  localStorage.clear()
})

describe('storageEngine', () => {
  it('initialises an empty store on first load', () => {
    const data = loadStore()
    expect(data.companies).toEqual([])
    expect(data.employees).toEqual([])
    expect(data.w2Documents).toEqual([])
  })

  it('persists and retrieves data', () => {
    saveStore({ companies: [{ id: '1', name: 'Test' }], employees: [], w2Documents: [], templates: [] })
    const data = loadStore()
    expect(data.companies).toHaveLength(1)
    expect(data.companies[0].name).toBe('Test')
  })

  it('saves and gets a collection', () => {
    saveCollection('companies', [{ id: '1' }, { id: '2' }])
    const result = getCollection('companies')
    expect(result).toHaveLength(2)
  })

  it('returns empty array for unknown collection', () => {
    loadStore()
    expect(getCollection('unknown')).toEqual([])
  })
})

describe('backup / restore', () => {
  it('exports a backup with metadata', () => {
    saveStore({ companies: [{ id: '1', name: 'Backup Corp' }], employees: [], w2Documents: [], templates: [] })
    const json = exportBackup()
    const parsed = JSON.parse(json)
    expect(parsed._backup).toBe(true)
    expect(parsed._schemaVersion).toBe(1)
    expect(parsed._exportedAt).toBeTruthy()
    expect(parsed.companies).toHaveLength(1)
  })

  it('restores a backup and replaces data', () => {
    saveStore({ companies: [{ id: 'old' }], employees: [], w2Documents: [], templates: [] })
    const backup = JSON.stringify({
      _backup: true, _schemaVersion: 1,
      companies: [{ id: 'new1' }, { id: 'new2' }],
      employees: [{ id: 'e1' }],
      w2Documents: [],
    })
    const result = importBackup(backup)
    expect(result.companies).toBe(2)
    expect(result.employees).toBe(1)
    // Old data replaced
    expect(getCollection('companies')).toHaveLength(2)
  })

  it('rejects invalid JSON', () => {
    expect(() => importBackup('not json')).toThrow('Invalid JSON')
  })

  it('rejects non-backup files', () => {
    expect(() => importBackup('{"hello": true}')).toThrow('does not appear')
  })
})

describe('clearAllData', () => {
  it('removes all stored data', () => {
    saveStore({ companies: [{ id: '1' }], employees: [], w2Documents: [], templates: [] })
    clearAllData()
    expect(localStorage.getItem('w2manager_data')).toBeNull()
  })
})

describe('getStorageInfo', () => {
  it('returns schema version and size', () => {
    saveStore({ companies: [], employees: [], w2Documents: [], templates: [] })
    const info = getStorageInfo()
    expect(info.schemaVersion).toBe(1)
    expect(Number(info.sizeKB)).toBeGreaterThan(0)
    expect(info.lastSaved).toBeTruthy()
  })
})
