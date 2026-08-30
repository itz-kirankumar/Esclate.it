"use client";

import { useState, useRef } from "react";
import { Mic, Camera, Send, Loader2, Type, ShieldCheck, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import KYCModal from "@/components/KYCModal";

export default function VentScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textComplaint, setTextComplaint] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, logout, kycStatus } = useAuth();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleRecordStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const handleRecordStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob && !textComplaint.trim()) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append("audio", audioBlob, "audio.webm");
      }
      if (textComplaint.trim()) {
        formData.append("textComplaint", textComplaint);
      }
      if (imageFile) {
        formData.append("image", imageFile, imageFile.name);
      }

      if (user) {
        formData.append("userId", user.uid);
      }

      const res = await fetch("/api/escalate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Failed to process claim");
      }
      
      // Store the real AI generated data in sessionStorage so the next page can display it!
      sessionStorage.setItem(data.claimId, JSON.stringify(data.data));

      // Redirect to the claim's Justice Tracker / Review Modal
      router.push(`/claim/${data.claimId}`);
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      alert(`Failed to submit claim: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative">
      <KYCModal />
      
      {/* User Profile Header */}
      {user && (
        <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="text-xs font-bold text-neutral-400 hover:text-white transition-colors tracking-wider flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full"
          >
            HISTORY
          </button>
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-full pl-2 pr-4 py-1.5 shadow-lg">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} alt="Profile" className="w-8 h-8 rounded-full border border-neutral-700" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-300 leading-tight">{user.displayName || user.email}</span>
              {kycStatus === 'verified' ? (
                <span className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-wider mt-0.5">
                  <ShieldCheck className="w-3 h-3"/> Verified
                </span>
              ) : (
                <span className="text-[10px] text-neutral-500 font-bold flex items-center gap-1 uppercase tracking-wider mt-0.5">
                  <ShieldAlert className="w-3 h-3"/> Unverified
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-xs font-bold text-neutral-500 hover:text-red-500 transition-colors uppercase tracking-wider"
          >
            Logout
          </button>
        </div>
      )}

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-md flex flex-col items-center space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Escalate.it</h1>
          <p className="text-neutral-400 font-medium">Don't get mad. Get paid.</p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex gap-4 bg-neutral-900 p-2 rounded-full border border-neutral-800">
          <button 
            onClick={() => setInputMode("voice")}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${inputMode === "voice" ? "bg-red-600 text-white" : "text-neutral-400 hover:text-white"}`}
          >
            Voice Mode
          </button>
          <button 
            onClick={() => setInputMode("text")}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${inputMode === "text" ? "bg-red-600 text-white" : "text-neutral-400 hover:text-white"}`}
          >
            Text Mode
          </button>
        </div>

        <div className="flex flex-col items-center justify-center w-full space-y-8">
          
          {inputMode === "voice" ? (
            <div className="flex flex-col items-center space-y-4">
              <button
                onPointerDown={handleRecordStart}
                onPointerUp={handleRecordStop}
                onPointerLeave={handleRecordStop}
                disabled={isProcessing || audioBlob !== null}
                className={`
                  relative flex items-center justify-center w-48 h-48 rounded-full 
                  transition-all duration-300 shadow-2xl
                  ${isRecording ? 'bg-red-600 scale-110 shadow-red-600/50' : 'bg-red-700 hover:bg-red-600 hover:scale-105 shadow-red-900/50'}
                  ${(isProcessing || audioBlob) ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                `}
              >
                {isRecording && (
                  <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
                )}
                <Mic className={`w-20 h-20 text-white ${isRecording ? 'animate-pulse' : ''}`} />
              </button>

              <p className="text-neutral-400 text-sm font-medium animate-pulse">
                {isRecording ? "Listening to your frustration..." : (audioBlob ? "Voice note captured" : "Hold to vent")}
              </p>
            </div>
          ) : (
            <textarea
              value={textComplaint}
              onChange={(e) => setTextComplaint(e.target.value)}
              placeholder="Type out exactly what happened and why you are frustrated..."
              className="w-full h-48 bg-neutral-900 border border-neutral-700 rounded-2xl p-4 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          )}

          {/* Secondary Actions */}
          <div className="flex items-center gap-6">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors border border-neutral-700 relative group"
              title="Upload Evidence Image"
            >
              <Camera className="w-6 h-6" />
              {!imageFile && (
                <span className="absolute -top-10 bg-neutral-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Attach Evidence
                </span>
              )}
            </button>

            {(audioBlob || textComplaint.trim()) && (
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors shadow-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{imageFile ? "Cross-checking Evidence..." : "Analyzing claim..."}</span>
                  </>
                ) : (
                  <>
                    <span>Draft Notice</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Uploaded Evidence Indicators */}
          {imageFile && (
            <div className="bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-lg text-sm text-neutral-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-green-500" />
              <span className="truncate max-w-[200px]">Evidence: {imageFile.name}</span>
              <button 
                onClick={() => setImageFile(null)}
                className="text-neutral-500 hover:text-red-500 ml-2 font-bold"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
