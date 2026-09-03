import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ADMIN_EMAIL = 'sajewel132@gmail.com';
export const ADMIN_UID = 'HI7LPBRcuLMRpk8D2i4WJLlT00n2';

export const getResetCycleDateStr = (): string => {
  const d = new Date();
  if (d.getHours() < 6) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const isAdmin = result.user.email === ADMIN_EMAIL || result.user.uid === ADMIN_UID;
        
        // Update user profile in Firestore for persistence if needed
        try {
            const userRef = doc(db, 'users', result.user.uid);
            const docSnap = await getDocFromServer(userRef).catch(() => null);
            const exists = docSnap && docSnap.exists();
            const data = exists ? docSnap.data() : null;

            const currentPoints = (data && data.points !== undefined) ? data.points : 100;
            const currentResetCycle = (data && data.lastDailyReset) || "";

            await setDoc(userRef, {
                uid: result.user.uid,
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                role: isAdmin ? 'admin' : 'user',
                points: currentPoints,
                lastDailyReset: currentResetCycle,
                lastLogin: serverTimestamp(),
                domain: window.location.hostname
            }, { merge: true });
        } catch (e) {
            console.warn("Could not sync user profile:", e);
        }

        return result.user;
    } catch (error: any) {
        console.error("Firebase Auth Error:", error);
        
        if (error.code === 'auth/popup-blocked') {
            alert("Sign-in popup blocked by browser. Please allow popups for this site and try again.");
        } else if (error.code === 'auth/popup-closed-by-user') {
            // User closed the popup before finishing sign-in
            console.log("Sign-in popup closed by user.");
        } else if (error.code === 'auth/unauthorized-domain') {
            alert(`Unauthorized domain. Please add the current domain to your Firebase Console 'Authorized domains' list: ${window.location.hostname}`);
        } else {
            alert(`Sign-in failed: ${error.message || 'Unknown error'}`);
        }
        throw error;
    }
};

export const logout = () => signOut(auth);
