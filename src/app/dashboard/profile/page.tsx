"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { History, ArrowLeft, Activity } from "lucide-react";

export default function ProfileTracking() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "claims"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClaims(data);
      } catch (error) {
        console.error("Failed to fetch claims history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <Activity className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <History className="w-8 h-8 text-red-500" />
              Escalation History
            </h1>
            <p className="text-neutral-400 mt-2">Track your past claims and legal notices.</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back to Arsenal
          </Link>
        </div>

        {claims.length === 0 ? (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
            You haven't fired any escalations yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {claims.map((claim) => (
              <Link href={`/claim/${claim.id}`} key={claim.id}>
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:bg-neutral-800/80 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                        {claim.data.case_metadata.respondent_company}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
                          claim.status === 'fired' 
                            ? 'bg-green-950/50 text-green-500 border-green-900/50' 
                            : 'bg-yellow-950/50 text-yellow-500 border-yellow-900/50'
                        }`}>
                          {claim.status === 'fired' ? 'Fired' : 'Drafted'}
                        </span>
                        <p className="text-sm text-neutral-400">{claim.data.case_metadata.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 bg-red-950 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider border border-red-900/50">
                        ₹{claim.data.case_metadata.estimated_claim_value_inr}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-300 line-clamp-2 mt-4">
                    {claim.data.user_summary.tl_dr}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
