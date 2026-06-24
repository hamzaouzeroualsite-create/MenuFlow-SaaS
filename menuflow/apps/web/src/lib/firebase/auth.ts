import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { docToData } from './firestore';
import type { User } from '@/types';
import { DEMO_USERS } from '@/lib/demo/data';

export async function loginWithEmail(email: string, password: string): Promise<User> {
  if (!isFirebaseConfigured) {
    const demoUser = DEMO_USERS.find((u) => u.email === email);
    if (!demoUser) throw new Error('Email ou mot de passe incorrect');
    if (password !== 'demo1234') throw new Error('Email ou mot de passe incorrect');
    return demoUser;
  }

  const credential = await signInWithEmailAndPassword(auth!, email, password);
  const user = await fetchUserProfile(credential.user);
  if (!user) throw new Error('Profil utilisateur introuvable');
  if (!user.isActive) throw new Error('Compte désactivé');
  return user;
}

export async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<User | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db!, 'users', firebaseUser.uid));
  if (!snap.exists()) return null;
  return docToData<User>(snap.id, snap.data());
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth!, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const profile = await fetchUserProfile(firebaseUser);
    callback(profile);
  });
}

export async function getCurrentUserProfile(): Promise<User | null> {
  if (!isFirebaseConfigured || !auth?.currentUser) return null;
  return fetchUserProfile(auth.currentUser);
}
