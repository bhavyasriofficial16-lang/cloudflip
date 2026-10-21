import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "cloudflip_cookie_consent_v1";

export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent("cloudflip-open-cookie-settings"));
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    preferences: true,
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    // Check if consent was already recorded
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setShowBanner(true);
    } else {
      try {
        setPreferences(JSON.parse(saved));
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setShowModal(true);
      setShowBanner(false);
    };
    window.addEventListener("cloudflip-open-cookie-settings", handleOpen);
    return () => window.removeEventListener("cloudflip-open-cookie-settings", handleOpen);
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const updated = { ...prefs, essential: true, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPreferences(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      preferences: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    saveConsent({
      essential: true,
      analytics: false,
      preferences: false,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <>
      {/* Floating Cookie Consent Banner */}
      {showBanner && !showModal && (
        <div
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-[480px] z-[99999] bg-white border-2 border-slate-300 rounded-2xl shadow-2xl p-5 text-slate-800 transition-all duration-200"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 text-[18px]">
              🍪
            </div>
            <div className="flex-1 text-[13px] leading-relaxed">
              <h3 className="font-display font-bold text-[14.5px] text-slate-900 mb-1">
                We value your privacy and security
              </h3>
              <p className="text-slate-600 mb-3 text-[12.5px]">
                CloudFlip uses essential cookies to guarantee session security and anti-bot verification, and optional cookies to analyze telemetry performance and remember preferences.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-semibold text-[12.5px] px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[12.5px] px-3 py-1.5 rounded-lg transition-colors"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-slate-600 hover:text-slate-900 font-medium text-[12px] underline underline-offset-2 px-1 py-1"
                >
                  Preferences
                </button>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Learn more in our{" "}
                <Link to="/cookies" className="text-sky-600 hover:underline">
                  Cookie Policy
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-sky-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[540px] w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🍪</span>
                <h2 className="font-display font-bold text-[18px] text-slate-900">
                  Cookie & Privacy Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-[20px] leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-[13px] text-slate-600 leading-relaxed">
              Customize which categories of cookies CloudFlip may store on your device. Strictly necessary cookies are required to authenticate your account and protect against automated bot abuse.
            </p>

            <div className="space-y-3.5">
              {/* Essential */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13.5px] text-slate-900">
                      Strictly Necessary Cookies
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-normal">
                    Required for user authentication sessions, CSRF token validation, and CloudFlip Bot Shield human verification challenges.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="mt-1 w-4 h-4 text-sky-600 rounded cursor-not-allowed opacity-70"
                />
              </div>

              {/* Performance & Analytics */}
              <div className="border border-slate-200 rounded-xl p-3.5 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13.5px] text-slate-900">
                      Performance & Telemetry
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-normal">
                    Helps us aggregate page latency benchmarks, CloudWatch query timings, and system error rates to optimize platform speed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="mt-1 w-4 h-4 text-sky-600 rounded cursor-pointer focus:ring-sky-500"
                />
              </div>

              {/* Functional & Preferences */}
              <div className="border border-slate-200 rounded-xl p-3.5 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13.5px] text-slate-900">
                      Functional & Preference Settings
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-normal">
                    Preserves UI states, such as selected AWS regions, simulation graph parameters, and collapse states.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, preferences: e.target.checked }))
                  }
                  className="mt-1 w-4 h-4 text-sky-600 rounded cursor-pointer focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Link
                to="/cookies"
                onClick={() => setShowModal(false)}
                className="text-[12px] text-slate-500 hover:text-slate-800 underline"
              >
                View Full Cookie Policy →
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-[13px] font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveConsent(preferences)}
                  className="bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
