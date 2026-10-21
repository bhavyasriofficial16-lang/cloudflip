import { useState, useEffect } from "react";
import CloudFlipLogo from "./CloudFlipLogo";
import HumanVerification from "./HumanVerification";

export function triggerSecurityVerification() {
  window.dispatchEvent(new CustomEvent("cloudflip-trigger-security-check"));
}

export default function SecurityCheckpoint() {
  const [verified, setVerified] = useState<boolean>(() => {
    return sessionStorage.getItem("cloudflip_shield_verified") === "true";
  });
  const [showInterstitial, setShowInterstitial] = useState<boolean>(() => {
    return sessionStorage.getItem("cloudflip_shield_verified") !== "true";
  });
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  useEffect(() => {
    const handleTrigger = () => {
      setShowInterstitial(true);
      setVerified(false);
    };
    window.addEventListener("cloudflip-trigger-security-check", handleTrigger);
    return () => window.removeEventListener("cloudflip-trigger-security-check", handleTrigger);
  }, []);

  const handleVerified = (token: string) => {
    sessionStorage.setItem("cloudflip_shield_verified", "true");
    sessionStorage.setItem("cloudflip_cf_token", token);
    setVerified(true);
    setRedirecting(true);

    setTimeout(() => {
      setShowInterstitial(false);
      setRedirecting(false);
    }, 900);
  };

  const handleBypass = () => {
    sessionStorage.setItem("cloudflip_shield_verified", "true");
    setVerified(true);
    setShowInterstitial(false);
  };

  return (
    <>
      {/* Cloudflare-style Start Human Verification Interstitial */}
      {showInterstitial && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999999] bg-white flex flex-col justify-between p-6 sm:p-12 text-slate-800 font-sans"
        >
          {/* Top Brand */}
          <div className="max-w-[620px] w-full mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <CloudFlipLogo size={28} />
              <span className="text-[11px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                Shield Defense v2.4
              </span>
            </div>
          </div>

          {/* Central Verification Card */}
          <div className="max-w-[620px] w-full mx-auto my-auto space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full text-[12px] font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                Browser Integrity Check
              </div>
              <h1 className="font-display font-bold text-[28px] sm:text-[34px] text-slate-900 leading-tight">
                Verifying your connection is secure
              </h1>
              <p className="text-[14.5px] text-slate-600 mt-2 leading-relaxed">
                <strong className="text-slate-900">cloudflip.me</strong> needs to review the security of your connection before granting access to predictive cloud infrastructure.
              </p>
            </div>

            {/* Verification Widget Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
              {!redirecting ? (
                <>
                  <div className="text-[12px] text-slate-500 mb-2 font-medium">
                    Please complete the security challenge below to proceed:
                  </div>
                  <HumanVerification onVerify={handleVerified} />
                </>
              ) : (
                <div className="flex items-center gap-3 py-3 text-emerald-700 font-semibold text-[14px]">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[12px]">
                    ✓
                  </div>
                  <span>Connection verified successfully. Redirecting to CloudFlip…</span>
                </div>
              )}
            </div>

            {/* Subtext info */}
            <div className="flex items-center justify-between text-[12px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Protected by CloudFlip Bot Shield & Rate Limiter</span>
              </div>
              <button
                type="button"
                onClick={handleBypass}
                className="text-slate-500 hover:text-slate-800 underline text-[12px]"
              >
                Skip in Demo Mode →
              </button>
            </div>
          </div>

          {/* Bottom Ray ID & Footer */}
          <div className="max-w-[620px] w-full mx-auto text-[11px] text-slate-400 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>Ray ID: <code className="font-mono text-slate-600">8f49b2c0192e44a</code> · Performance & Security by CloudFlip Edge</div>
            <div>TLS 1.3 · 256-Bit Cryptographic Integrity</div>
          </div>
        </div>
      )}

      {/* Floating Shield Status Badge (Bottom-Left) */}
      {!showInterstitial && (
        <button
          type="button"
          onClick={() => setShowStatusModal(true)}
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[99990] bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-2 transition-all cursor-pointer group"
          title="Click to view CloudFlip Security & Human Verification Status"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
          <span>🛡️ CloudFlip Shield</span>
          <span className="text-[10px] text-slate-400">Verified</span>
        </button>
      )}

      {/* Security Status Details Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🛡️</span>
                <h3 className="font-display font-bold text-[16px] text-slate-900">
                  CloudFlip Security Shield Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-700 text-[20px] leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5 text-[12.5px] text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Human Verification:</span>
                <span className="font-semibold text-emerald-600">✓ Verified (Token Active)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Transport Encryption:</span>
                <span className="font-semibold text-slate-900">TLS 1.3 / AES-256</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Bot Mitigation:</span>
                <span className="font-semibold text-sky-600">CloudFlip Shield + Turnstile</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Rate Limiting:</span>
                <span className="font-semibold text-slate-900">Active (120 req/min sliding)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowStatusModal(false);
                  sessionStorage.removeItem("cloudflip_shield_verified");
                  setVerified(false);
                  setShowInterstitial(true);
                }}
                className="text-[12px] text-sky-600 hover:underline font-medium"
              >
                Re-test Verification Challenge ↻
              </button>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="bg-slate-900 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
