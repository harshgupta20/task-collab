// src/firebase/firestore.js
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { app } from "./config";

const db = getFirestore(app);

// ADD DOCUMENT (auto ID)
export const addData = (col, data) => {
  return addDoc(collection(db, col), data);
};

// SET DOCUMENT (manual ID)
export const setData = (col, id, data) => {
  return setDoc(doc(db, col, id), data);
};

// GET DOCUMENT
export const getData = async (col, id) => {
  const docSnap = await getDoc(doc(db, col, id));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// GET COLLECTION
export const getCollection = async (col) => {
  const snapshot = await getDocs(collection(db, col));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// QUERY COLLECTION
export const queryCollection = async (col, field, op, value) => {
  const q = query(collection(db, col), where(field, op, value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// UPDATE DOCUMENT
export const updateData = async (col, id, data) => {
  return await updateDoc(doc(db, col, id), data);
};

// DELETE DOCUMENT
export const deleteData = async (col, id) => {
  return await deleteDoc(doc(db, col, id));
};



/** -----------------------------------------------------------------------------------------------------
 * Query Firestore with flexible options.
 *
 * @param {string} col            - Collection name
 * @param {Array} conditions      - Array of where conditions
 *                                  Example: [["age", ">=", 18], ["role", "==", "admin"]]
 * @param {Array} orders          - Array of order rules
 *                                  Example: [["age", "desc"], ["name", "asc"]]
 * @param {number} max            - limit number
 */
export const customQueryCollection = async (
  col,
  conditions = [],
  orders = [],
  max = null
) => {
  let q = query(collection(db, col));

  // Add WHERE conditions
  conditions.forEach(([field, op, value]) => {
    q = query(q, where(field, op, value));
  });

  // Add ORDER BY
  orders.forEach(([field, direction]) => {
    q = query(q, orderBy(field, direction));
  });

  // Add LIMIT
  if (max) q = query(q, limit(max));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
// ----------------------------------------------------------------------------------------------------- */

export { db };
