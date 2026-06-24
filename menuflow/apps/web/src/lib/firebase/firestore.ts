import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

export const COLLECTIONS = {
  restaurants: 'restaurants',
  users: 'users',
  categories: 'categories',
  products: 'products',
  orders: 'orders',
  reservations: 'reservations',
  customers: 'customers',
  reviews: 'reviews',
  subscriptions: 'subscriptions',
  analytics: 'analytics',
  notifications: 'notifications',
  auditLogs: 'auditLogs',
  qrCodes: 'qrCodes',
} as const;

export function toISOString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export function docToData<T>(id: string, data: DocumentData): T {
  const result: Record<string, unknown> = { id, ...data };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Timestamp) {
      result[key] = (result[key] as Timestamp).toDate().toISOString();
    }
  }
  return result as T;
}

export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db!, collectionName, id));
  if (!snap.exists()) return null;
  return docToData<T>(snap.id, snap.data());
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db!, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<T>(d.id, d.data()));
}

export async function getByRestaurantId<T>(
  collectionName: string,
  restaurantId: string,
  extraConstraints: QueryConstraint[] = []
): Promise<T[]> {
  return getDocuments<T>(collectionName, [
    where('restaurantId', '==', restaurantId),
    ...extraConstraints,
  ]);
}

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db!, collectionName), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => docToData<T>(d.id, d.data())));
  });
}

export async function createDocument<T extends Record<string, unknown>>(
  collectionName: string,
  data: T,
  customId?: string
): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured');
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  if (customId) {
    await setDoc(doc(db!, collectionName, customId), payload);
    return customId;
  }
  const ref = await addDoc(collection(db!, collectionName), payload);
  return ref.id;
}

export async function updateDocument(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured');
  await updateDoc(doc(db!, collectionName, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error('Firebase not configured');
  await deleteDoc(doc(db!, collectionName, id));
}

export async function createAuditLog(entry: {
  userId: string;
  userName: string;
  action: string;
  resource: string;
  restaurantId?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  if (!isFirebaseConfigured) return;
  await addDoc(collection(db!, COLLECTIONS.auditLogs), {
    ...entry,
    createdAt: serverTimestamp(),
  });
}

export { where, orderBy, limit, serverTimestamp, writeBatch, doc, collection };
