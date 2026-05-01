import { db } from "./config"
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
} from "firebase/firestore"

// Get all documents from a collection with optional filters
export const getDocuments = async (collectionName: string, filters: any[] = [], orderByField?: string, orderDirection: "asc" | "desc" = "desc") => {
  const colRef = collection(db, collectionName)
  let q: any = colRef
  
  if (filters.length) {
    filters.forEach((filter) => {
      q = query(q, where(filter.field, filter.operator, filter.value))
    })
  }
  
  if (orderByField) {
    q = query(q, orderBy(orderByField, orderDirection))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Get a single document by ID
export const getDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id)
  const snapshot = await getDoc(docRef)
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() }
  }
  return null
}

// Add a new document
export const addDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
  })
  return { id: docRef.id, ...data }
}

// Update a document
export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() })
  return { id, ...data }
}

// Set a document with a specific ID
export const setDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id)
  await setDoc(docRef, {
    ...data,
    createdAt: Timestamp.now(),
  })
  return { id, ...data }
}

// Delete a document
export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
  return { id }
}
