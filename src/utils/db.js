const DB_NAME = 'refmanager'
const DB_VERSION = 1
const STORE = 'pdfs'

let dbPromise = null

function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore(STORE)
      }
      req.onsuccess = e => resolve(e.target.result)
      req.onerror = e => reject(e.target.error)
    })
  }
  return dbPromise
}

export const db = {
  async savePDF(id, blob) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(blob, id)
      tx.oncomplete = () => resolve()
      tx.onerror = e => reject(e.target.error)
    })
  },

  async getPDF(id) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(id)
      req.onsuccess = e => resolve(e.target.result || null)
      req.onerror = e => reject(e.target.error)
    })
  },

  async deletePDF(id) {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = e => reject(e.target.error)
    })
  },
}
