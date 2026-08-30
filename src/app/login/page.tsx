"use client";

import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col items-center space-y-8 bg-neutral-900/50 p-8 rounded-3xl border border-neutral-800 backdrop-blur-xl">
        <div className="flex flex-col items-center space-y-4 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Escalate.it</h1>
          <p className="text-neutral-400 text-sm font-medium">
            Authenticate to access the Consumer Defense Arsenal.
          </p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-200 text-black font-bold py-4 px-6 rounded-full transition-all shadow-xl hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  );
}
