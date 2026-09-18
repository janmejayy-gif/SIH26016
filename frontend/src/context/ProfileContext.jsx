import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  name: "A. Deshmukh",
  role: "Acquisition Officer",
  department: "DoLR, MoRD",
};

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDefaultsFromFirebase(firebaseUser) {
  if (!firebaseUser) return DEFAULT_PROFILE;
  return {
    name: firebaseUser.displayName || DEFAULT_PROFILE.name,
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || null,
    role: DEFAULT_PROFILE.role,
    department: DEFAULT_PROFILE.department,
  };
}

export function ProfileProvider({ children, firebaseUser }) {
  const defaults = useMemo(() => getDefaultsFromFirebase(firebaseUser), [firebaseUser]);

  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("ladi-profile");
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch {
      // ignore parse errors
    }
    return defaults;
  });

  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem("ladi-profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    setSaveMessage("Profile updated successfully");
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  const value = useMemo(() => ({
    profile,
    updateProfile,
    saveMessage,
    initials: getInitials(profile.name),
  }), [profile, saveMessage]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}