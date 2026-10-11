import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp, configured, authProvider } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) {
      setError(error);
    } else {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white text-slate-900 font-sans">
      <div className="w-full max-w-[380px]">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-[19px] justify-center mb-8 text-slate-900">
          <span className="text-cyan-500">☁</span> CloudFlip<span className="text-cyan-500">.ai</span>
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
          <h1 className="font-display font-bold text-[20px] mb-1 text-slate-900">
            {mode === "login" ? "Log in" : "Create your account"}
          </h1>
          <p className="text-[13px] text-slate-500 mb-6">
            {mode === "login" ? "Welcome back to CloudFlip." : "Free to start — no credit card required."}
          </p>

          <div className="text-[12px] bg-sky-50 border border-sky-200 text-sky-800 rounded-md px-3 py-2 mb-5 font-medium flex items-center justify-between">
            <span>Auth System:</span>
            <span className="font-semibold uppercase tracking-wider text-[11px] bg-white px-2 py-0.5 rounded border border-sky-200">
              {authProvider} AUTH
            </span>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2.5 text-[14px] text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            {error && <p className="text-[12.5px] text-red-600 font-medium">{error}</p>}
            <button
              type="submit" disabled={busy}
              className="bg-[#4FD1E8] text-[#04141A] font-semibold rounded-md py-2.5 text-[14px] mt-1.5 hover:bg-[#3ec4db] transition-colors shadow-xs disabled:opacity-50"
            >
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <p className="text-[12.5px] text-slate-500 text-center mt-5">
            {mode === "login" ? (
              <>No account? <Link to="/signup" className="text-sky-600 font-semibold hover:underline">Sign up</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-sky-600 font-semibold hover:underline">Log in</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
