import { useState } from "react";
import { Shield, ShieldAlert, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function KYCModal() {
  const { kycStatus, verifyKYC } = useAuth();
  const [isOpen, setIsOpen] = useState(kycStatus === "unverified");
  const [isVerifying, setIsVerifying] = useState(false);

  if (kycStatus === "verified" || !isOpen) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    // Simulate verification delay for prototype
    setTimeout(async () => {
      await verifyKYC();
      setIsOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center border border-red-900/50">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white">Action Required: KYC</h2>
          
          <p className="text-neutral-400 text-sm leading-relaxed">
            Legal escalations via Escalate.it have a <strong className="text-white">300% higher success rate</strong> when filed by a verified identity. 
            Authenticate your profile to enable Government Portal routing.
          </p>

          <div className="w-full pt-4 space-y-3">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>Verifying Identity...</>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify with Aadhaar (Prototype)
                </>
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
