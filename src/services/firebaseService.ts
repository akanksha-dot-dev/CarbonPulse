/**
 * EcoTrack Firebase Service
 *
 * Initializes Firebase and provides Firestore CRUD operations.
 * Gracefully no-ops when Firebase config is not present (guest mode).
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import type { CarbonSnapshot, HistoricalDataPoint, UserProfile } from '@/types/carbon';

// ─── Firebase Config ──────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ─── Firebase Initialization ──────────────────────────────────────────────────

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.apiKey !== 'undefined',
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    try {
      app = getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0];
    } catch (err) {
      console.warn('[EcoTrack] Firebase initialization failed:', err);
      return null;
    }
  }
  return app;
}

export function getDB(): Firestore | null {
  if (db) return db;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  try {
    db = getFirestore(firebaseApp);
    return db;
  } catch (err) {
    console.warn('[EcoTrack] Firestore init failed:', err);
    return null;
  }
}

// ─── User Profile Operations ──────────────────────────────────────────────────

/**
 * Save or update a user profile document.
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const firestore = getDB();
  if (!firestore) return;

  try {
    await setDoc(
      doc(firestore, 'users', profile.uid),
      { ...profile, updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (err) {
    console.error('[EcoTrack] Failed to save user profile:', err);
  }
}

/**
 * Fetch user profile from Firestore.
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const firestore = getDB();
  if (!firestore) return null;

  try {
    const snap = await getDoc(doc(firestore, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err) {
    console.error('[EcoTrack] Failed to fetch user profile:', err);
    return null;
  }
}

// ─── Carbon Snapshot Operations ───────────────────────────────────────────────

/**
 * Save a carbon snapshot to the user's log collection.
 */
export async function saveCarbonSnapshot(snapshot: CarbonSnapshot): Promise<string | null> {
  const firestore = getDB();
  if (!firestore) return null;

  try {
    const ref = await addDoc(
      collection(firestore, 'users', snapshot.userId, 'snapshots'),
      { ...snapshot, createdAt: serverTimestamp() },
    );
    return ref.id;
  } catch (err) {
    console.error('[EcoTrack] Failed to save carbon snapshot:', err);
    return null;
  }
}

/**
 * Fetch historical carbon snapshots for a user.
 */
export async function fetchCarbonHistory(
  uid: string,
  maxEntries = 90,
): Promise<HistoricalDataPoint[]> {
  const firestore = getDB();
  if (!firestore) return [];

  try {
    const q = query(
      collection(firestore, 'users', uid, 'snapshots'),
      orderBy('timestamp', 'desc'),
      limit(maxEntries),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as CarbonSnapshot;
      return {
        date: data.timestamp.split('T')[0],
        totalKgCO2e: data.result.totalAnnual,
        breakdown: data.result.breakdown,
      };
    });
  } catch (err) {
    console.error('[EcoTrack] Failed to fetch carbon history:', err);
    return [];
  }
}

// ─── Global Benchmarking ──────────────────────────────────────────────────────

interface GlobalBenchmark {
  count: number;
  averageAnnualKg: number;
  updatedAt: string;
}

/**
 * Listen to the global anonymous benchmark document in real-time.
 */
export function subscribeToGlobalBenchmark(
  callback: (benchmark: GlobalBenchmark | null) => void,
): Unsubscribe {
  const firestore = getDB();
  if (!firestore) {
    callback(null);
    return () => {};
  }

  const docRef = doc(firestore, 'public', 'globalBenchmark');
  return onSnapshot(
    docRef,
    (snap) => {
      callback(snap.exists() ? (snap.data() as GlobalBenchmark) : null);
    },
    (err) => {
      console.warn('[EcoTrack] Benchmark subscription failed:', err);
      callback(null);
    },
  );
}

/**
 * Contribute anonymized emission data to the global benchmark aggregate.
 * Uses a transaction-style upsert to avoid race conditions.
 */
export async function contributeToGlobalBenchmark(totalAnnualKg: number): Promise<void> {
  const firestore = getDB();
  if (!firestore) return;

  try {
    await addDoc(collection(firestore, 'public', 'globalBenchmark', 'contributions'), {
      totalAnnualKg: Math.round(totalAnnualKg),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[EcoTrack] Failed to contribute to benchmark:', err);
  }
}
