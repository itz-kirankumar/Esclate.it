"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle, Mail, ExternalLink, Activity, ArrowLeft, Scale } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Mock Data structure based on the schema
type ClaimData = {
  case_metadata: {
    respondent_company: string;
    category: string;
    statutory_violation: string;
    estimated_claim_value_inr: number;
  };
  escalation_assets: {
    nodal_officer_email: {
      subject_line: string;
      body: string;
      cc_authorities: string[];
    };
    social_media_draft: {
      platform: string;
      content: string;
      suggested_hashtags: string[];
    };
  };
  user_summary: {
    tl_dr: string;
  };
};

export default function ClaimReview() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [data, setData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFiring, setIsFiring] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const claimId = params.id as string;

  useEffect(() => {
    const fetchClaim = async () => {
      // 1. Try to get it from session storage (instant load from Vent screen)
      const storedData = sessionStorage.getItem(claimId);
      if (storedData) {
        try {
          setData(JSON.parse(storedData));
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse stored AI data", e);
        }
      }

      // 2. If not in session storage (e.g., accessed from History), fetch from Firestore
      try {
        const claimRef = doc(db, "claims", claimId);
        const claimSnap = await getDoc(claimRef);
        if (claimSnap.exists()) {
          const fbData = claimSnap.data();
          setData(fbData.data as ClaimData);
          if (fbData.status === "fired") {
            setDispatched(true);
          }
        }
      } catch (error) {
        console.error("Error fetching claim from Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [claimId]);

  const handleEscalate = async () => {
    setIsFiring(true);
    
    try {
      // Update the status in Firestore
      const claimRef = doc(db, "claims", claimId);
      await updateDoc(claimRef, {
        status: "fired"
      });
      
      setTimeout(() => {
        setIsFiring(false);
        setDispatched(true);
      }, 1500);
    } catch (error) {
      console.error("Failed to update claim status", error);
      alert("Failed to escalate. Please try again.");
      setIsFiring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white space-y-4">
        <Activity className="w-12 h-12 text-red-500 animate-pulse" />
        <h2 className="text-xl font-bold">Summoning your Legal Notice...</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white space-y-4">
        <h2 className="text-xl font-bold text-red-500">Claim Not Found</h2>
        <p className="text-neutral-400">We couldn't find the AI generated data for this claim.</p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-neutral-800 rounded-full hover:bg-neutral-700">Go Back</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12 font-sans selection:bg-red-900/50 relative">
      
      {/* Top Navigation & User Profile */}
      <nav className="flex items-center justify-between mb-12 max-w-5xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {user && (
          <div className="flex items-center gap-4 z-50">
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="text-xs font-bold text-neutral-400 hover:text-white transition-colors tracking-wider flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full"
            >
              HISTORY
            </button>
            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-full pl-2 pr-4 py-1.5">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} alt="Profile" className="w-8 h-8 rounded-full border border-neutral-700" />
              <span className="text-sm font-medium text-neutral-300 hidden md:block">{user.displayName || user.email}</span>
            </div>
            <button 
              onClick={logout}
              className="text-xs font-bold text-neutral-500 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Summary */}
        <header className="border-b border-neutral-800 pb-8">
          <h1 className="text-4xl font-extrabold text-white mb-4">The Arsenal</h1>
          <p className="text-xl text-neutral-400 max-w-3xl leading-relaxed">
            {data.user_summary.tl_dr}
          </p>
        </header>

        {/* Claim Value & Statutory Violation */}
        <div className="bg-red-950/20 border border-red-900/50 p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-1">Targeting</h3>
              <p className="text-3xl text-white font-black tracking-tight">{data.case_metadata.respondent_company}</p>
            </div>
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-900/30 px-4 py-2 rounded-lg inline-flex">
              <Scale className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-200">{data.case_metadata.statutory_violation}</span>
            </div>
          </div>
          
          <div className="text-left md:text-right bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50 w-full md:w-auto">
            <h3 className="text-neutral-500 font-bold uppercase tracking-wider text-sm mb-1">Estimated Claim</h3>
            <p className="text-5xl text-white font-extrabold">₹{data.case_metadata.estimated_claim_value_inr}</p>
          </div>
        </div>

        {/* Generated Assets Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Email Draft */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Mail className="w-32 h-32" />
            </div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-red-500" />
              Nodal Notice
            </h3>
            <div className="space-y-4 text-sm relative z-10">
              <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/50 space-y-2">
                <p><span className="text-neutral-500 font-medium">Subject:</span> <span className="font-bold text-white">{data.escalation_assets.nodal_officer_email.subject_line}</span></p>
                <p><span className="text-neutral-500 font-medium">CC:</span> <span className="text-neutral-300">{data.escalation_assets.nodal_officer_email.cc_authorities.join(", ")}</span></p>
              </div>
              <div className="bg-neutral-950 p-5 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap text-neutral-300 h-64 overflow-y-auto border border-neutral-800 shadow-inner">
                {data.escalation_assets.nodal_officer_email.body}
              </div>
            </div>
          </div>

          {/* Social Media Draft */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageCircle className="w-32 h-32" />
            </div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              Public Strike
            </h3>
            <div className="space-y-4 relative z-10 h-full">
              <div className="bg-neutral-950 p-6 rounded-xl text-base text-neutral-200 leading-relaxed border border-neutral-800 shadow-inner">
                {data.escalation_assets.social_media_draft.content}
                <div className="mt-6 flex flex-wrap gap-2">
                  {data.escalation_assets.social_media_draft.suggested_hashtags.map((tag, i) => (
                    <span key={i} className="text-blue-400 font-medium bg-blue-950/30 px-2 py-1 rounded-md text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center justify-center py-12">
          {!dispatched ? (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleEscalate}
                disabled={isFiring}
                className={`
                  relative px-16 py-6 rounded-full text-2xl font-black text-white
                  overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(220,38,38,0.3)] hover:shadow-[0_0_60px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95
                  ${isFiring ? 'bg-red-800' : 'bg-red-600 hover:bg-red-500'}
                `}
              >
                {isFiring && <div className="absolute inset-0 bg-red-400 animate-pulse mix-blend-overlay" />}
                <span className="relative z-10 flex items-center gap-3">
                  {isFiring ? 'FIRING WEBHOOKS...' : 'ESCALATE.IT'}
                  {!isFiring && <ExternalLink className="w-6 h-6" />}
                </span>
              </button>
              <p className="text-neutral-500 text-sm font-medium">Clicking this will dispatch the notices and mark the claim as fired in your history.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-green-500 animate-in fade-in zoom-in duration-500 bg-green-950/20 p-8 rounded-3xl border border-green-900/30">
              <CheckCircle2 className="w-20 h-20 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              <h2 className="text-3xl font-black text-white tracking-tight">Shots Fired.</h2>
              <p className="text-neutral-400 mt-2 text-lg">Notice sent. Tweet live. The clock is ticking.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
