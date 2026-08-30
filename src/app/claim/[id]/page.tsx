"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, MessageCircle, Mail, ExternalLink, Activity } from "lucide-react";

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
  const [data, setData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFiring, setIsFiring] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    // 1. Get the actual AI data from session storage using the claim ID
    const storedData = sessionStorage.getItem(params.id as string);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (e) {
        console.error("Failed to parse stored AI data", e);
      }
    }
    setLoading(false);
  }, [params.id]);

  const handleEscalate = () => {
    setIsFiring(true);
    setTimeout(() => {
      setIsFiring(false);
      setDispatched(true);
    }, 2000);
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
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12 font-sans selection:bg-red-900/50">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Summary */}
        <header className="border-b border-neutral-800 pb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white mb-2">The Arsenal</h1>
          <p className="text-lg text-neutral-400 max-w-2xl">
            {data.user_summary.tl_dr}
          </p>
        </header>

        {/* Claim Value */}
        <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-1">Targeting</h3>
            <p className="text-2xl text-white font-semibold">{data.case_metadata.respondent_company}</p>
          </div>
          <div className="text-right">
            <h3 className="text-red-500 font-bold uppercase tracking-wider text-sm mb-1">Estimated Claim</h3>
            <p className="text-3xl text-white font-extrabold">₹{data.case_metadata.estimated_claim_value_inr}</p>
          </div>
        </div>

        {/* Generated Assets Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Email Draft */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mail className="w-24 h-24" />
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-red-500" />
              Nodal Notice
            </h3>
            <div className="space-y-4 text-sm relative z-10">
              <p><span className="text-neutral-500">Subject:</span> <span className="font-medium text-white">{data.escalation_assets.nodal_officer_email.subject_line}</span></p>
              <p><span className="text-neutral-500">CC:</span> {data.escalation_assets.nodal_officer_email.cc_authorities.join(", ")}</p>
              <div className="bg-neutral-950 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap text-neutral-400 h-48 overflow-y-auto">
                {data.escalation_assets.nodal_officer_email.body}
              </div>
            </div>
          </div>

          {/* Social Media Draft */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageCircle className="w-24 h-24" />
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Public Strike
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="bg-neutral-950 p-4 rounded-lg text-sm text-neutral-300">
                {data.escalation_assets.social_media_draft.content}
                <div className="mt-4 text-blue-400 font-medium">
                  {data.escalation_assets.social_media_draft.suggested_hashtags.join(" ")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-col items-center justify-center pt-8">
          {!dispatched ? (
            <button
              onClick={handleEscalate}
              disabled={isFiring}
              className={`
                relative px-12 py-6 rounded-full text-2xl font-black text-white
                overflow-hidden transition-all duration-300 shadow-2xl hover:scale-105
                ${isFiring ? 'bg-red-800' : 'bg-red-600 hover:bg-red-500 shadow-red-600/50'}
              `}
            >
              {isFiring && <div className="absolute inset-0 bg-red-400 animate-pulse mix-blend-overlay" />}
              <span className="relative z-10 flex items-center gap-3">
                {isFiring ? 'FIRING WEBHOOKS...' : 'ESCALATE.IT'}
                {!isFiring && <ExternalLink className="w-6 h-6" />}
              </span>
            </button>
          ) : (
            <div className="flex flex-col items-center text-green-500 animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="w-20 h-20 mb-4" />
              <h2 className="text-2xl font-bold text-white">Shots Fired.</h2>
              <p className="text-neutral-400 mt-2">Notice sent. Tweet live. The clock is ticking.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
