"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  kycStatus: "unverified" | "verified";
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  verifyKYC: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  kycStatus: "unverified",
  loginWithGoogle: async () => {},
  logout: async () => {},
  verifyKYC: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<"unverified" | "verified">("unverified");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        
        // Fetch existing data to get KYC status
        const userSnap = await getDoc(userRef);
        let currentKycStatus: "unverified" | "verified" = "unverified";
        
        if (userSnap.exists()) {
          currentKycStatus = userSnap.data().kycStatus || "unverified";
        }
        
        setKycStatus(currentKycStatus);

        // Upsert user into Firestore
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastLogin: serverTimestamp(),
          kycStatus: currentKycStatus,
        }, { merge: true });
        
        // If they are on login page or landing page, redirect to dashboard
        if (pathname === "/login" || pathname === "/") {
          router.push("/dashboard");
        }
      } else {
        setKycStatus("unverified");
        // Mandatory login check (Allow / and /login)
        if (pathname !== "/login" && pathname !== "/") {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };
  
  const verifyKYC = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { kycStatus: "verified" }, { merge: true });
    setKycStatus("verified");
  };

  return (
    <AuthContext.Provider value={{ user, loading, kycStatus, loginWithGoogle, logout, verifyKYC }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
