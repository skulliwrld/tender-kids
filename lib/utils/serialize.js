export const serializeMongoDoc = (doc) => {
  if (!doc) return null
  
  if (Array.isArray(doc)) {
    return doc.map(item => serializeMongoDoc(item))
  }
  
  if (typeof doc !== 'object') return doc
  
  if (doc.toJSON) {
    doc = doc.toJSON()
  }
  
  const serialized = {}
  for (const [key, value] of Object.entries(doc)) {
    if (value === null || value === undefined) {
      serialized[key] = value
    } else if (value instanceof Date) {
      serialized[key] = value.toISOString()
    } else if (typeof value === 'object' && value !== null) {
      if (value._bsontype === 'ObjectId' || value.constructor?.name === 'ObjectId' || value.constructor?.name === 'ObjectID') {
        serialized[key] = String(value)
      } else if (Array.isArray(value)) {
        serialized[key] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? (item._bsontype === 'ObjectId' || item.constructor?.name === 'ObjectId' || item.constructor?.name === 'ObjectID' ? String(item) : serializeMongoDoc(item))
            : item
        )
      } else {
        serialized[key] = serializeMongoDoc(value)
      }
    } else {
      serialized[key] = value
    }
  }
  return serialized
}