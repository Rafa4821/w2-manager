/**
 * Generic CRUD repository factory.
 *
 * Wraps a storage back-end (currently LocalStorage via storageEngine) behind a
 * uniform interface.  Every entity-specific repository calls `createRepository`
 * with its collection name and Zod schemas, and gets back a full set of typed
 * CRUD operations, search, and filter helpers.
 *
 * When a future API replaces LocalStorage, only the four storage callbacks
 * (readAll / writeAll / etc.) need to change — feature code stays untouched.
 */

import { getCollection, saveCollection } from '../persistence'

function generateId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function now() {
  return new Date().toISOString()
}

export function createRepository(collectionName, { schema, createSchema: _createSchema }) {
  // ── Internal helpers ────────────────────────────────────────────
  function readAll() {
    return getCollection(collectionName)
  }

  function writeAll(items) {
    saveCollection(collectionName, items)
  }

  // ── Public CRUD ─────────────────────────────────────────────────
  function getAll() {
    return readAll()
  }

  function getById(id) {
    const items = readAll()
    return items.find((item) => item.id === id) ?? null
  }

  function create(data) {
    const timestamp = now()
    const record = {
      ...data,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Validate full record
    const result = schema.safeParse(record)
    if (!result.success) {
      const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      throw new Error(`Validation failed:\n${errors.join('\n')}`)
    }

    const items = readAll()
    items.push(result.data)
    writeAll(items)
    return result.data
  }

  function update(id, data) {
    const items = readAll()
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) throw new Error(`${collectionName} record not found: ${id}`)

    const merged = { ...items[index], ...data, id, updatedAt: now() }

    const result = schema.safeParse(merged)
    if (!result.success) {
      const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      throw new Error(`Validation failed:\n${errors.join('\n')}`)
    }

    items[index] = result.data
    writeAll(items)
    return result.data
  }

  function remove(id) {
    const items = readAll()
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) throw new Error(`${collectionName} record not found: ${id}`)

    const removed = items[index]
    items.splice(index, 1)
    writeAll(items)
    return removed
  }

  function search(query, fields = []) {
    if (!query) return readAll()
    const q = query.toLowerCase()
    const items = readAll()
    return items.filter((item) => {
      return fields.some((field) => {
        const val = item[field]
        return typeof val === 'string' && val.toLowerCase().includes(q)
      })
    })
  }

  function filter(predicate) {
    return readAll().filter(predicate)
  }

  function count(predicate) {
    if (!predicate) return readAll().length
    return readAll().filter(predicate).length
  }

  function exists(id) {
    return readAll().some((item) => item.id === id)
  }

  function bulkCreate(records) {
    const items = readAll()
    const created = []
    for (const data of records) {
      const timestamp = now()
      const record = { ...data, id: generateId(), createdAt: timestamp, updatedAt: timestamp }
      const result = schema.safeParse(record)
      if (!result.success) {
        const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
        throw new Error(`Bulk create validation failed:\n${errors.join('\n')}`)
      }
      items.push(result.data)
      created.push(result.data)
    }
    writeAll(items)
    return created
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    search,
    filter,
    count,
    exists,
    bulkCreate,
  }
}
