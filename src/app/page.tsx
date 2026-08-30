"use client";

import { useState, useRef } from "react";
import { Mic, Camera, Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VentScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    if (!audioBlob) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/escalate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Failed to process claim");
      }
      
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
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-md flex flex-col items-center space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Escalate.it</h1>
          <p className="text-neutral-400 font-medium">Don't get mad. Get paid.</p>
        </div>

        <div className="flex flex-col items-center justify-center w-full space-y-8">
          {/* Main Record Button */}
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
            {isRecording ? "Listening to your frustration..." : (audioBlob ? "Ready to escalate" : "Hold to vent")}
          </p>

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
              className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors border border-neutral-700"
            >
              <Camera className="w-6 h-6" />
            </button>

            {audioBlob && (
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
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
              <Camera className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{imageFile.name}</span>
              <button 
                onClick={() => setImageFile(null)}
                className="text-neutral-500 hover:text-white ml-2"
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
