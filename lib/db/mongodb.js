/**
 * MongoDB Connection Utility
 * Provides a simple interface for database operations
 */

import { connectToDB } from '../Database/connectToDB'

/**
 * Get MongoDB connection
 * @returns {Promise} MongoDB connection promise
 */
export async function connectDB() {
  return await connectToDB()
}

/**
 * Find documents in a collection
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @returns {Promise<Array>} Array of documents
 */
export async function findDocuments(collection, query = {}) {
  const mongoose = await connectDB()

  // Map collection names to Mongoose models
  const modelMap = {
    'assessments': 'Assessment',
    'grades': 'Grade',
    'results': 'Result',
    'students': 'Student',
    'teachers': 'Teacher',
    'subjects': 'Subject',
    'classes': 'Class',
    'users': 'User'
  }

  const modelName = modelMap[collection.toLowerCase()]
  if (!modelName) {
    throw new Error(`Unknown collection: ${collection}`)
  }

  const Model = mongoose.models[modelName] || mongoose.model(modelName, require(`@/models/${modelName.toLowerCase()}.model`).default.schema)

  return await Model.find(query).exec()
}

/**
 * Insert a document into a collection
 * @param {string} collection - Collection name
 * @param {Object} document - Document to insert
 * @returns {Promise<Object>} Inserted document
 */
export async function insertDocument(collection, document) {
  const mongoose = await connectDB()

  const modelMap = {
    'assessments': 'Assessment',
    'grades': 'Grade',
    'results': 'Result',
    'students': 'Student',
    'teachers': 'Teacher',
    'subjects': 'Subject',
    'classes': 'Class',
    'users': 'User'
  }

  const modelName = modelMap[collection.toLowerCase()]
  if (!modelName) {
    throw new Error(`Unknown collection: ${collection}`)
  }

  const Model = mongoose.models[modelName] || mongoose.model(modelName, require(`@/models/${modelName.toLowerCase()}.model`).default.schema)

  const newDoc = new Model(document)
  return await newDoc.save()
}

/**
 * Update a document in a collection
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @param {Object} update - Update object
 * @returns {Promise<Object>} Update result
 */
export async function updateDocument(collection, query, update) {
  const mongoose = await connectDB()

  const modelMap = {
    'assessments': 'Assessment',
    'grades': 'Grade',
    'results': 'Result',
    'students': 'Student',
    'teachers': 'Teacher',
    'subjects': 'Subject',
    'classes': 'Class',
    'users': 'User'
  }

  const modelName = modelMap[collection.toLowerCase()]
  if (!modelName) {
    throw new Error(`Unknown collection: ${collection}`)
  }

  const Model = mongoose.models[modelName] || mongoose.model(modelName, require(`@/models/${modelName.toLowerCase()}.model`).default.schema)

  return await Model.findOneAndUpdate(query, update, { new: true })
}

/**
 * Delete a document from a collection
 * @param {string} collection - Collection name
 * @param {Object} query - Query object
 * @returns {Promise<Object>} Delete result
 */
export async function deleteDocument(collection, query) {
  const mongoose = await connectDB()

  const modelMap = {
    'assessments': 'Assessment',
    'grades': 'Grade',
    'results': 'Result',
    'students': 'Student',
    'teachers': 'Teacher',
    'subjects': 'Subject',
    'classes': 'Class',
    'users': 'User'
  }

  const modelName = modelMap[collection.toLowerCase()]
  if (!modelName) {
    throw new Error(`Unknown collection: ${collection}`)
  }

  const Model = mongoose.models[modelName] || mongoose.model(modelName, require(`@/models/${modelName.toLowerCase()}.model`).default.schema)

  return await Model.findOneAndDelete(query)
}

export default { connectDB, findDocuments, insertDocument, updateDocument, deleteDocument }