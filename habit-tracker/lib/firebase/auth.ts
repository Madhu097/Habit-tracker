import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from 'firebase/auth';
import { auth } from './config';

export const signUp = async (email: string, password: string, displayName?: string): Promise<FirebaseUser> => {
    if (!auth) throw new Error('Firebase auth not initialized');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    return userCredential.user;
};

export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    if (!auth) throw new Error('Firebase auth not initialized');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

/**
 * Setup ReCaptcha for Phone Auth
 */
export const setupRecaptcha = (containerId: string): RecaptchaVerifier | null => {
    if (!auth) return null;
    return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
    });
};

/**
 * Send OTP to Phone Number
 */
export const sendOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    if (!auth) throw new Error('Firebase auth not initialized');
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

export const logOut = async (): Promise<void> => {
    if (!auth) throw new Error('Firebase auth not initialized');
    await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void): (() => void) => {
    if (!auth) {
        callback(null);
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): FirebaseUser | null => {
    if (!auth) return null;
    return auth.currentUser;
};

