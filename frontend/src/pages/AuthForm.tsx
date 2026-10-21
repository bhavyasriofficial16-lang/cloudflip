import { FormEvent, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CloudFlipLogo from "../components/CloudFlipLogo";
import HumanVerification from "../components/HumanVerification";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp, authProvider } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Client-side rate-limiting / lockout defense
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutSeconds]);

  // Password strength computation for sign-up
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak (add 8+ chars & numbers)", color: "bg-rose-500" };
    if (score <= 3) return { score: 2, label: "Good (add symbols for extra security)", color: "bg-amber-500" };
    return { score: 3, label: "Strong & Enterprise Ready", color: "bg-emerald-500" };
  }, [password]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      setError(`Security cooldown active. Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    if (!humanVerified) {
      setError("Please complete the human verification check below.");
      return;
    }

    if (mode === "signup" && !agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to proceed.");
      return;
    }

    setBusy(true);
    setError(null);

    const fn = mode === "login" ? signIn : signUp;
    const { error: authError } = await fn(email, password);
    setBusy(false);

    if (authError) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutSeconds(30);
        setError("Too many consecutive attempts. Rate limit security cooldown activated (30s).");
      } else {
        setError(authError);
      }
    } else {
      setFailedAttempts(0);
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 bg-slate-50/60 text-slate-900 font-sans">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="flex justify-center mb-6">
          <CloudFlipLogo size={32} textSize="text-[21px]" />
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="font-display font-bold text-[22px] mb-1 text-slate-900">
            {mode === "login" ? "Log in to CloudFlip" : "Create your account"}
          </h1>
          <p className="text-[13px] text-slate-500 mb-5">
            {mode === "login"
              ? "Welcome back. Authenticate to manage predictive telemetry."
              : "Free to start — zero credit card required to simulate."}
          </p>

          <div className="text-[12px] bg-sky-50/80 border border-sky-200 text-sky-800 rounded-lg px-3 py-2 mb-5 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Identity Engine:
            </span>
            <span className="font-mono font-semibold uppercase tracking-wider text-[11px] bg-white px-2 py-0.5 rounded border border-sky-200">
              {authProvider} AUTH
            </span>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="name@company.com"
                className="w-full bg-slate-50/60 border border-slate-300 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••••••"
                className="w-full bg-slate-50/60 border border-slate-300 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />

              {/* Password Strength Indicator for Signup */}
              {mode === "signup" && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Password Strength:</span>
                    <span className="font-medium text-slate-700">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Human Verification (Anti-Bot Challenge) */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1">
                Security Verification
              </label>
              <HumanVerification
                onVerify={(tok) => {
                  setHumanVerified(true);
                  setVerificationToken(tok);
                  setError(null);
                }}
                onExpire={() => {
                  setHumanVerified(false);
                  setVerificationToken(null);
                }}
              />
            </div>

            {/* Terms of Service & Privacy Acceptance for Sign Up */}
            {mode === "signup" && (
              <div className="flex items-start gap-2.5 mt-1 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    setError(null);
                  }}
                  className="mt-1 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[12px] text-slate-600 leading-snug cursor-pointer">
                  I agree to CloudFlip’s{" "}
                  <Link to="/terms" target="_blank" className="text-sky-600 font-semibold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="text-sky-600 font-semibold hover:underline">
                    Privacy Policy
                  </Link>
                  , and accept essential security cookies.
                </label>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[12.5px] text-rose-700 font-medium flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy || lockoutSeconds > 0 || !humanVerified || (mode === "signup" && !agreeTerms)}
              className="bg-[#4FD1E8] text-[#04141A] font-semibold rounded-lg py-2.5 text-[14px] mt-2 hover:bg-[#3ec4db] transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating…</span>
                </>
              ) : lockoutSeconds > 0 ? (
                `Locked (${lockoutSeconds}s)`
              ) : mode === "login" ? (
                "Log in to Dashboard →"
              ) : (
                "Create Enterprise Account →"
              )}
            </button>
          </form>

          {/* Switch Login / Signup */}
          <p className="text-[12.5px] text-slate-500 text-center mt-5">
            {mode === "login" ? (
              <>
                New to CloudFlip?{" "}
                <Link to="/signup" className="text-sky-600 font-semibold hover:underline">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/login" className="text-sky-600 font-semibold hover:underline">
                  Log in
                </Link>
              </>
            )}
          </p>

          {/* Enterprise Security Badges */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1" title="256-Bit SSL/TLS In-Transit Encryption">
              <span>🔒</span> 256-Bit SSL
            </span>
            <span>•</span>
            <span className="flex items-center gap-1" title="Cloudflare DDoS and Bot Shield Mitigation">
              <span>🛡️</span> Bot Shield
            </span>
            <span>•</span>
            <span className="flex items-center gap-1" title="SOC 2 Type II Architecture">
              <span>✓</span> SOC 2 Ready
            </span>
          </div>
        </div>

        {/* Legal links under form */}
        <div className="text-center mt-4 text-[11.5px] text-slate-400 space-x-3">
          <Link to="/terms" className="hover:text-slate-600">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <span>·</span>
          <Link to="/cookies" className="hover:text-slate-600">Cookie Settings</Link>
          <span>·</span>
          <Link to="/security" className="hover:text-slate-600">Security Architecture</Link>
        </div>
      </div>
    </div>
  );
}
