function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kaizha-art', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('images')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
export async function loadAssets() {
  const db = await database()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('images')
      const store = transaction.objectStore('images')
      const keys = store.getAllKeys(), values = store.getAll()
      transaction.oncomplete = () => resolve(Object.fromEntries(keys.result.map((key, i) => [key, values.result[i]])))
      transaction.onerror = () => reject(transaction.error)
    })
  } finally { db.close() }
}
export async function storeAsset(id, blob, sheet) {
  const db = await database()
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('images', 'readwrite')
      transaction.objectStore('images').put({ blob, sheet }, id)
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally { db.close() }
}
