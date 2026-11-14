/**
 * IndexedDB persistence engine with synchronous in-memory cache.
 *
 * On startup, `initStorage()` loads all data from IndexedDB into memory.
 * After that, reads are instant (from cache) and writes update both the
 * cache and IndexedDB. Data persists across sessions and survives
 * localStorage clears — it only disappears if you explicitly clear it
 * through this engine or wipe the browser's site data.
 *
 * If IndexedDB is empty on first run, it auto-migrates any existing
 * localStorage data so nothing is lost.
 */

const DB_NAME = 'w2manager_db'
const DB_VERSION = 1
const STORE_NAME = 'data'
const DATA_KEY = 'store'
const META_KEY = 'meta'

// Legacy localStorage keys (for migration)
const LS_DATA_KEY = 'w2manager_data'
const LS_META_KEY = 'w2manager_meta'

const CURRENT_SCHEMA_VERSION = 1

// ── In-memory cache ──────────────────────────────────────────────
let _cache = null
let _metaCache = null
let _db = null
let _ready = false

// ── Migrations ───────────────────────────────────────────────────
const migrations = {
  // Version 1 is the initial schema — no migration needed.
  // Future: 2: (data) => { ... return data }
}

function getEmptyStore() {
  return {
    companies: [],
    employees: [],
    w2Documents: [],
    templates: [],
  }
}

// ── IndexedDB helpers ────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

function idbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function idbPut(db, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(value, key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

function idbDelete(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// ── Persist to IndexedDB (fire-and-forget) ───────────────────────

function persistToIDB() {
  if (!_db) return
  const data = { ..._cache }
  const meta = { ..._metaCache }
  Promise.all([
    idbPut(_db, DATA_KEY, data),
    idbPut(_db, META_KEY, meta),
  ]).catch((err) => console.error('[StorageEngine] IndexedDB write failed:', err))
}

// ── Migration from localStorage ──────────────────────────────────

function migrateFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem(LS_DATA_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    const metaRaw = window.localStorage.getItem(LS_META_KEY)
    const meta = metaRaw ? JSON.parse(metaRaw) : null
    console.info('[StorageEngine] Migrating data from localStorage to IndexedDB...')
    return { data, meta }
  } catch {
    return null
  }
}

function runMigrations(data, fromVersion) {
  let current = fromVersion
  while (current < CURRENT_SCHEMA_VERSION) {
    const next = current + 1
    const migrate = migrations[next]
    if (migrate) {
      try {
        data = migrate(data)
      } catch (err) {
        throw new Error(`Migration v${current}→v${next} failed: ${err.message}`, { cause: err })
      }
    }
    current = next
  }
  return data
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Initialize storage — call once at app startup before rendering.
 * Loads data from IndexedDB (or migrates from localStorage on first run).
 */
export async function initStorage() {
  if (_ready) return

  try {
    _db = await openDB()

    // Try loading from IndexedDB first
    let data = await idbGet(_db, DATA_KEY)
    let meta = await idbGet(_db, META_KEY)

    if (!data) {
      // Nothing in IndexedDB — check localStorage for migration
      const legacy = migrateFromLocalStorage()
      if (legacy?.data) {
        data = legacy.data
        meta = legacy.meta
        // Save to IndexedDB
        await idbPut(_db, DATA_KEY, data)
        if (meta) await idbPut(_db, META_KEY, meta)
        console.info('[StorageEngine] Migration complete. localStorage data preserved as backup.')
      } else {
        // Fresh start
        data = getEmptyStore()
        meta = { schemaVersion: CURRENT_SCHEMA_VERSION, lastSaved: new Date().toISOString() }
        await idbPut(_db, DATA_KEY, data)
        await idbPut(_db, META_KEY, meta)
      }
    }

    // Run schema migrations if needed
    const storedVersion = meta?.schemaVersion ?? 0
    if (storedVersion < CURRENT_SCHEMA_VERSION) {
      try {
        data = runMigrations(data, storedVersion)
        meta = { ...meta, schemaVersion: CURRENT_SCHEMA_VERSION }
        await idbPut(_db, DATA_KEY, data)
        await idbPut(_db, META_KEY, meta)
      } catch (err) {
        console.error('[StorageEngine] Migration failed, resetting:', err)
        data = getEmptyStore()
        meta = { schemaVersion: CURRENT_SCHEMA_VERSION, lastSaved: new Date().toISOString() }
      }
    }

    // Ensure all collections exist
    if (!data.companies) data.companies = []
    if (!data.employees) data.employees = []
    if (!data.w2Documents) data.w2Documents = []
    if (!data.templates) data.templates = []

    _cache = data
    _metaCache = meta || { schemaVersion: CURRENT_SCHEMA_VERSION, lastSaved: new Date().toISOString() }
    _ready = true
  } catch (err) {
    console.error('[StorageEngine] IndexedDB init failed, falling back to memory:', err)
    _cache = getEmptyStore()
    _metaCache = { schemaVersion: CURRENT_SCHEMA_VERSION, lastSaved: new Date().toISOString() }
    _ready = true
  }
}

/**
 * Check if storage has been initialized.
 */
export function isStorageReady() {
  return _ready
}

export function loadStore() {
  if (!_ready) {
    // Fallback for tests or pre-init calls
    _cache = _cache || getEmptyStore()
    _metaCache = _metaCache || { schemaVersion: CURRENT_SCHEMA_VERSION, lastSaved: null }
  }
  return _cache
}

export function saveStore(data) {
  _cache = data
  _metaCache = {
    ..._metaCache,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastSaved: new Date().toISOString(),
  }
  persistToIDB()
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
  return JSON.stringify(
    {
      _backup: true,
      _exportedAt: new Date().toISOString(),
      _schemaVersion: _metaCache?.schemaVersion ?? CURRENT_SCHEMA_VERSION,
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
  const collections = { ...parsed }
  delete collections._backup
  delete collections._exportedAt
  delete collections._schemaVersion
  let data = { ...getEmptyStore(), ...collections }

  if (backupVersion < CURRENT_SCHEMA_VERSION) {
    data = runMigrations(data, backupVersion)
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
  _cache = getEmptyStore()
  _metaCache = { schemaVersion: CURRENT_SCHEMA_VERSION, lastSaved: null }
  if (_db) {
    Promise.all([
      idbDelete(_db, DATA_KEY),
      idbDelete(_db, META_KEY),
    ]).catch((err) => console.error('[StorageEngine] Clear failed:', err))
  }
  // Also clear legacy localStorage
  try {
    window.localStorage.removeItem(LS_DATA_KEY)
    window.localStorage.removeItem(LS_META_KEY)
  } catch { /* ignore */ }
}

export function getStorageInfo() {
  const data = loadStore()
  const raw = JSON.stringify(data)
  return {
    schemaVersion: _metaCache?.schemaVersion ?? 0,
    lastSaved: _metaCache?.lastSaved ?? null,
    sizeBytes: raw.length,
    sizeKB: (raw.length / 1024).toFixed(1),
    storageType: 'IndexedDB',
    totalRecords:
      (data.companies?.length || 0) +
      (data.employees?.length || 0) +
      (data.w2Documents?.length || 0),
  }
}
