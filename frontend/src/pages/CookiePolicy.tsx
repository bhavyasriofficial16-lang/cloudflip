import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";
import { openCookiePreferences } from "../components/CookieConsent";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <CloudFlipLogo size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Terms of Service
            </Link>
            <Link
              to="/app"
              className="bg-[#4FD1E8] text-[#04141A] font-semibold text-[13.5px] rounded-lg px-4 py-2 hover:bg-[#3ec4db] transition-colors shadow-xs"
            >
              Open App →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[840px] mx-auto px-4 sm:px-8 py-12 space-y-10 text-[14px] text-slate-700 leading-relaxed">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Compliance & Transparency
          </span>
          <h1 className="font-display font-extrabold text-[32px] sm:text-[38px] text-slate-900 mt-1">
            Cookie & Tracking Technologies Policy
          </h1>
          <p className="text-[13px] text-slate-500 mt-2">
            Last updated: October 21, 2026 · Complies with EU ePrivacy Directive, GDPR, and CCPA
          </p>
        </div>

        {/* Quick action bar */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-[15px] text-sky-950">
              Control Your Cookie Preferences
            </h3>
            <p className="text-[13px] text-sky-900 mt-0.5">
              You can review, modify, or revoke your cookie choices at any time.
            </p>
          </div>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-semibold text-[13px] px-4 py-2 rounded-xl transition-colors shadow-xs whitespace-nowrap"
          >
            Open Cookie Preferences ⚙️
          </button>
        </div>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[20px] text-slate-900">
            1. What Are Cookies & Local Storage?
          </h2>
          <p>
            Cookies are small text files placed on your computer or mobile device when you visit websites. Similar technologies include web storage (<code className="text-sky-700 bg-slate-100 px-1 py-0.5 rounded">localStorage</code> and <code className="text-sky-700 bg-slate-100 px-1 py-0.5 rounded">sessionStorage</code>), pixel tags, and device fingerprints. These technologies allow CloudFlip to authenticate users securely, mitigate automated bot abuse, remember user UI states, and monitor operational telemetry performance.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-[20px] text-slate-900">
            2. Categories of Cookies Used by CloudFlip
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono text-[11.5px] uppercase">
                <tr>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Key / Cookie Name</th>
                  <th className="p-3.5">Lifespan</th>
                  <th className="p-3.5">Purpose & Function</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">
                    Strictly Necessary
                  </td>
                  <td className="p-3.5 font-mono text-[12px] text-sky-700">
                    sb-*-auth-token, cloudflip_cf_token
                  </td>
                  <td className="p-3.5">Session / 30 Days</td>
                  <td className="p-3.5">
                    Maintains user authentication, JWT cryptographic signature verification, and CloudFlip Shield human verification tokens to thwart automated bot attacks.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">
                    Strictly Necessary
                  </td>
                  <td className="p-3.5 font-mono text-[12px] text-sky-700">
                    cloudflip_cookie_consent_v1
                  </td>
                  <td className="p-3.5">365 Days</td>
                  <td className="p-3.5">
                    Records the user’s explicit consent choices to comply with GDPR & ePrivacy requirements.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">
                    Performance & Telemetry
                  </td>
                  <td className="p-3.5 font-mono text-[12px] text-sky-700">
                    _cf_telemetry_perf
                  </td>
                  <td className="p-3.5">90 Days</td>
                  <td className="p-3.5">
                    Aggregates simulation calculation timings, latency metrics, and API responsiveness benchmarks. Does not store personal identifiable data.
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-slate-900">
                    Functional & UI
                  </td>
                  <td className="p-3.5 font-mono text-[12px] text-sky-700">
                    cf_default_region, cf_sidebar_state
                  </td>
                  <td className="p-3.5">180 Days</td>
                  <td className="p-3.5">
                    Remembers default AWS region selections (e.g. us-east-1) and navigation menu states across sessions.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[20px] text-slate-900">
            3. Third-Party Integrations
          </h2>
          <p>
            When utilizing optional enterprise integrations, third parties may deposit cookies:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Cloudflare:</strong> Cloudflare Turnstile bot management tokens deployed to prevent automated DDoS attacks.
            </li>
            <li>
              <strong>Razorpay & Stripe:</strong> Fraud detection and PCI-DSS compliant secure checkout tokens during subscription activation.
            </li>
            <li>
              <strong>AWS STS:</strong> Ephemeral token exchanges for customer-controlled IAM cross-account authentication.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[20px] text-slate-900">
            4. Managing Cookies in Your Browser
          </h2>
          <p>
            You can prevent the setting of cookies by adjusting your browser settings. Be advised that disabling strictly necessary cookies will prevent you from signing in or authenticating to the CloudFlip platform.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[13px]">
            <li><strong>Google Chrome:</strong> Settings → Privacy & Security → Third-party cookies</li>
            <li><strong>Apple Safari:</strong> Preferences → Privacy → Block all cookies / Prevent cross-site tracking</li>
            <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection</li>
            <li><strong>Microsoft Edge:</strong> Settings → Cookies and Site Permissions</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="font-display font-bold text-[20px] text-slate-900">
            5. Contact Our Privacy Officer
          </h2>
          <p>
            If you have questions regarding our cookie practices, please contact our Data Governance & Security team at{" "}
            <a href="mailto:bhavyasriofficial16@gmail.com" className="text-sky-600 underline">
              bhavyasriofficial16@gmail.com
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
}
