import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";
import { openCookiePreferences } from "../components/CookieConsent";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <CloudFlipLogo size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Cookie Policy
            </Link>
            <Link to="/app" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Open App →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[840px] mx-auto px-4 sm:px-8 py-12 space-y-9 text-[14px] text-slate-700 leading-relaxed">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Data Governance & Privacy
          </span>
          <h1 className="font-display font-extrabold text-[32px] sm:text-[38px] text-slate-900 mt-1">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Last updated: October 21, 2026 · Complies with EU GDPR, UK GDPR, and California Consumer Privacy Act (CCPA)
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">1. Information We Collect</h2>
          <p>
            CloudFlip collects minimal telemetry necessary to provide predictive capacity scaling and anomaly detection:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Name, work email address, and authentication identifiers.</li>
            <li><strong>Infrastructure Telemetry:</strong> CloudWatch aggregated metric series (CPU utilization percentages, network throughput, request counts, and latency statistics).</li>
            <li><strong>Security & Anti-Bot Telemetry:</strong> Client browser headers, IP address (hashed for rate limiting), and human verification challenge validation tokens.</li>
            <li><strong>Inventory Metadata:</strong> Resource IDs, instance types, Availability Zones, and resource tags (e.g. <code>env: prod</code>).</li>
          </ul>
        </section>

        <section className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h2 className="font-display font-bold text-[18px] text-slate-900">2. What We Never Collect</h2>
          <p className="text-[13.5px]">
            CloudFlip is architecturally isolated from your user data. We do <strong>not</strong> collect, process, or inspect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[13px] mt-2">
            <li>Customer Personally Identifiable Information (PII) of your end-users</li>
            <li>HTTP request/response body payloads, customer cookies, or query parameters</li>
            <li>Application database records, backups, or table contents</li>
            <li>Source code, proprietary models, or Git repository commits</li>
          </ul>
        </section>

        {/* Section 3: Cookies and Tracking */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">
            3. Cookies & Tracking Technologies
          </h2>
          <p>
            We use strictly necessary cookies for session authentication and anti-bot verification, and optional cookies to evaluate telemetry latency. We do not sell or monetize personal information. For full details on cookie categories and duration, see our{" "}
            <Link to="/cookies" className="text-sky-600 font-semibold hover:underline">
              Cookie Policy
            </Link>
            . You can modify your preferences at any time using our{" "}
            <button
              type="button"
              onClick={openCookiePreferences}
              className="text-sky-600 font-semibold underline"
            >
              Cookie Preferences Manager
            </button>
            .
          </p>
        </section>

        {/* Section 4: GDPR & CCPA Rights */}
        <section className="space-y-3 bg-sky-50/70 border border-sky-200 rounded-xl p-5">
          <h2 className="font-display font-bold text-[18px] text-slate-900">
            4. Your Data Rights (GDPR & CCPA)
          </h2>
          <p className="text-[13.5px] text-slate-700">
            Under the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you have explicit rights regarding your data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-[13px] mt-2">
            <li><strong>Right to Know & Access:</strong> You can request a summary of telemetry metadata and account credentials stored in our database.</li>
            <li><strong>Right to Rectification:</strong> You can update inaccurate account details directly in Settings or by contacting support.</li>
            <li><strong>Right to Deletion:</strong> You may request permanent deletion of all telemetry records and account records.</li>
            <li><strong>Right to Data Portability:</strong> Export historical telemetry datasets in JSON/CSV format.</li>
            <li><strong>Non-Discrimination:</strong> We will never penalize or alter service tiers for exercising privacy rights.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">5. How We Protect Data</h2>
          <p>
            Collected telemetry is used exclusively to compute ARIMA forecasts, detect capacity bottlenecks, and trigger automated scaling. All communications are secured using TLS 1.3 in transit and AES-256 encryption at rest. CloudFlip operates out-of-band: should any disruption occur, your production services remain 100% unaffected.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">6. Data Retention & Erasure</h2>
          <p>
            Metric aggregates are retained on a rolling 30-day window and automatically purged. You may request immediate deletion of all account records and historical telemetry by emailing{" "}
            <a href="mailto:bhavyasriofficial16@gmail.com" className="text-sky-600 underline">
              bhavyasriofficial16@gmail.com
            </a>.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 bg-slate-50/70 text-slate-500 text-[12px] mt-12">
        <div className="max-w-[840px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 CloudFlip Platform. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-800">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-slate-800">Cookie Policy</Link>
            <button type="button" onClick={openCookiePreferences} className="hover:text-slate-800 underline">
              Cookie Preferences
            </button>
            <Link to="/security" className="hover:text-slate-800">Security Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
