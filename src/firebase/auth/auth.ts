'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, type Firestore, arrayUnion } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function storeUserInFirestore(firestore: Firestore, user: any) {
    if (!firestore || !user) return;
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
    };
    setDoc(userRef, userData, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'write',
            requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}


export async function signInWithGoogle(auth: Auth, firestore: Firestore) {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Ensure every user has a display name.
    if (!user.displayName) {
        const fallbackDisplayName = user.email?.split('@')[0] || 'Nouvel utilisateur';
        // We await the profile update to ensure the auth object is updated
        await updateProfile(user, { displayName: fallbackDisplayName });
        
        // We create a plain object to pass to storeUserInFirestore,
        // because the `user` object from the result might not reflect the change immediately.
        const userToStore = {
            uid: user.uid,
            email: user.email,
            displayName: fallbackDisplayName,
            photoURL: user.photoURL
        };
        storeUserInFirestore(firestore, userToStore);
    } else {
        // If display name exists, just store the user data.
        storeUserInFirestore(firestore, user);
    }
    
    // Return the original user object from the auth result
    return user;
  } catch (error) {
    // Errors are handled by the calling function, which shows a toast.
    return null;
  }
}

export async function signUpWithEmail(auth: Auth, firestore: Firestore, email: string, password: string, displayName: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    
    const userToStore = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName,
        photoURL: result.user.photoURL,
    };
    storeUserInFirestore(firestore, userToStore);

    return result.user;
  } catch (error) {
    // Errors are handled by the calling function, which shows a toast.
    return null;
  }
}

export async function signInWithEmail(auth: Auth, email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    // Errors are handled by the calling function, which shows a toast.
    return null;
  }
}

export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    // The calling function handles UI changes, no need to log here.
  }
}

export async function updateUserProfile(auth: Auth, firestore: Firestore, user: User, newData: { displayName: string }) {
    try {
        // Update Firebase Auth profile
        await updateProfile(user, {
            displayName: newData.displayName
        });

        // Update Firestore document
        const userRef = doc(firestore, 'users', user.uid);
        const updateData = { displayName: newData.displayName };
        updateDoc(userRef, updateData).catch(async (serverError) => {
             const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        return true;
    } catch (error) {
        // Errors are handled by the calling function, which shows a toast.
        return false;
    }
}

export async function hideLearningPathForUser(firestore: Firestore, userId: string, pathId: string) {
    if (!firestore || !userId || !pathId) return;

    const userRef = doc(firestore, 'users', userId);
    const updateData = { hiddenPaths: arrayUnion(pathId) };

    updateDoc(userRef, updateData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}
