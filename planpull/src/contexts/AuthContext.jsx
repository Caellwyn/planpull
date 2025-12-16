import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Returns true if this is a new user (first time sign up)
    async function createUserDocument(user) {
        if (!user) return false;

        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const { email, displayName } = user;
                const name = displayName || email.split('@')[0];

                try {
                    await setDoc(userRef, {
                        email,
                        displayName: name,
                        createdAt: serverTimestamp(),
                        subscriptionStatus: 'none',
                        pagesUsedThisPeriod: 0,
                        hasSeenWelcome: false
                    });
                    return true; // New user
                } catch (error) {
                    console.error("Error creating user document", error);
                }
            }
            return false; // Existing user
        } catch (error) {
            console.error("Error checking user document", error);
            return false;
        }
    }

    async function signup(email, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const isNewUser = await createUserDocument(userCredential.user);
        return { userCredential, isNewUser };
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const isNewUser = await createUserDocument(userCredential.user);
        return { userCredential, isNewUser };
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
