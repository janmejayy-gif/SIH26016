import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, googleProvider } from "../firebase.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      let message = "Failed to sign in with Google";
      if (err.code === "auth/popup-closed-by-user") {
        message = "Sign-in was cancelled";
      } else if (err.code === "auth/cancelled-popup-request") {
        message = "Another sign-in request is in progress";
      } else if (err.code === "auth/network-request-failed") {
        message = "Network error. Please check your connection";
      }
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError("Failed to sign out");
      throw err;
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    if (!user) return;
    try {
      await updateProfile(user, updates);
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      setError("Failed to update profile");
      throw err;
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    loginWithGoogle,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}