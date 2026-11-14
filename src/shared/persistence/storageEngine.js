/**
 * Versioned LocalStorage persistence engine.
 *
 * IMPORTANT — LocalStorage is used here for local development and testing with
 * fictitious data only.  It is NOT appropriate for real SSN, EIN or salary
 * data: its contents are accessible to any script running on the same origin
 * and it provides no access-control guarantees.  A production deployment must
 * replace this layer with server-side, encrypted storage behind proper
 * authentication.
 */

const STORAGE_KEY = 'w2manager_data'
const META_KEY = 'w2manager_meta'
const CURRENT_SCHEMA_VERSION = 1

// ── Migrations ───────────────────────────────────────────────────
// Each migration receives the full data blob and returns the upgraded version.
// Keyed by the version they *produce* (i.e. migration[2] upgrades v1 → v2).
const migrations = {
  // Version 1 is the initial schema — no migration needed.
  // Future example:
  // 2: (data) => {
  //   // add a new field to every company
  //   data.companies = data.companies.map(c => ({ ...c, newField: '' }))
  //   return data
  // },
}

function getEmptyStore() {
  return {
    companies: [],
    employees: [],
    w2Documents: [],
    templates: [],
  }
}

function getMeta() {
  try {
    const raw = window.localStorage.getItem(META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setMeta(meta) {
  window.localStorage.setItem(META_KEY, JSON.stringify(meta))
}

function runMigrations(data, fromVersion) {
  let current = fromVersion
  const migrationLog = []

  while (current < CURRENT_SCHEMA_VERSION) {
    const next = current + 1
    const migrate = migrations[next]
    if (migrate) {
      try {
        data = migrate(data)
        migrationLog.push({ from: current, to: next, status: 'ok' })
      } catch (err) {
        migrationLog.push({ from: current, to: next, status: 'error', error: err.message })
        throw new Error(`Migration v${current}→v${next} failed: ${err.message}`, { cause: err })
      }
    }
    current = next
  }

  return { data, migrationLog }
}

// ── Public API ───────────────────────────────────────────────────

export function loadStore() {
  const meta = getMeta()
  let data

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    data = raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('[StorageEngine] Failed to parse stored data:', err)
    data = null
  }

  if (!data) {
    // First run — initialise with empty store
    data = getEmptyStore()
    saveStore(data)
    return data
  }

  const storedVersion = meta?.schemaVersion ?? 0

  if (storedVersion < CURRENT_SCHEMA_VERSION) {
    try {
      const { data: migrated } = runMigrations(data, storedVersion)
      data = migrated
      saveStore(data)
    } catch (err) {
      console.error('[StorageEngine] Migration failed, resetting:', err)
      data = getEmptyStore()
      saveStore(data)
    }
  }

  // Ensure all expected collections exist
  if (!data.companies) data.companies = []
  if (!data.employees) data.employees = []
  if (!data.w2Documents) data.w2Documents = []
  if (!data.templates) data.templates = []

  return data
}

export function saveStore(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setMeta({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lastSaved: new Date().toISOString(),
    })
  } catch (err) {
    // QuotaExceededError or other write failures
    console.error('[StorageEngine] Failed to save:', err)
    throw new Error('Could not save data to LocalStorage. Storage may be full.', { cause: err })
  }
}

export function getCollection(name) {
  const data = loadStore()
  return data[name] ?? []
}

export function saveCollection(name, items) {
  const data = loadStore()
  data[name] = items
  saveStore(data)
}

// ── Backup / Restore ─────────────────────────────────────────────

export function exportBackup() {
  const data = loadStore()
  const meta = getMeta()
  return JSON.stringify(
    {
      _backup: true,
      _exportedAt: new Date().toISOString(),
      _schemaVersion: meta?.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      ...data,
    },
    null,
    2,
  )
}

export function importBackup(jsonString) {
  let parsed
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error('Invalid JSON — the file does not contain valid backup data.')
  }

  if (!parsed._backup) {
    throw new Error('This file does not appear to be a W2 Manager backup.')
  }

  const backupVersion = parsed._schemaVersion ?? 0

  // Strip internal metadata before storing
  const collections = { ...parsed }
  delete collections._backup
  delete collections._exportedAt
  delete collections._schemaVersion
  let data = { ...getEmptyStore(), ...collections }

  // Run any necessary migrations on the imported data
  if (backupVersion < CURRENT_SCHEMA_VERSION) {
    const { data: migrated } = runMigrations(data, backupVersion)
    data = migrated
  }

  saveStore(data)
  return {
    companies: data.companies.length,
    employees: data.employees.length,
    w2Documents: data.w2Documents.length,
    templates: data.templates.length,
  }
}

export function clearAllData() {
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(META_KEY)
}

export function getStorageInfo() {
  const meta = getMeta()
  const raw = window.localStorage.getItem(STORAGE_KEY) || ''
  return {
    schemaVersion: meta?.schemaVersion ?? 0,
    lastSaved: meta?.lastSaved ?? null,
    sizeBytes: raw.length,
    sizeKB: (raw.length / 1024).toFixed(1),
  }
}
