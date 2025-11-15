// src/firebase/storage.js
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "./config";

const storage = getStorage(app);

// UPLOAD FILE
export const uploadFile = async (path, file) => {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

// GET FILE URL
export const getFileURL = (path) => {
  return getDownloadURL(ref(storage, path));
};

// DELETE FILE
export const deleteFile = (path) => {
  return deleteObject(ref(storage, path));
};

export { storage };
