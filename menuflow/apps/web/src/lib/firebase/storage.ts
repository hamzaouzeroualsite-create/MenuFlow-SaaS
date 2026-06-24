import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export async function uploadImage(
  path: string,
  file: File
): Promise<string> {
  if (!isFirebaseConfigured) {
    return URL.createObjectURL(file);
  }
  const storageRef = ref(storage!, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(path: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  await deleteObject(ref(storage!, path));
}
