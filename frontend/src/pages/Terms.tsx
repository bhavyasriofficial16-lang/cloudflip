import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";
import { openCookiePreferences } from "../components/CookieConsent";

export default function Terms() {
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
            Legal Agreement & Service Terms
          </span>
          <h1 className="font-display font-extrabold text-[32px] sm:text-[38px] text-slate-900 mt-1">
            Terms of Service
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Last updated: October 21, 2026 · CloudFlip Global Platform Terms
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CloudFlip ("Service", "we", "us"), provided by CloudFlip, you agree to be bound by these Terms of Service. If you are entering into these terms on behalf of a company, organization, or entity, you represent that you have the authority to bind that entity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">2. Description of Service & Operational Modes</h2>
          <p>
            CloudFlip provides predictive cloud infrastructure telemetry, capacity simulation, and automated remediation recommendations. The service offers three primary operating modes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Shadow Mode:</strong> Passive observation and log-only forecasting with zero write permissions.</li>
            <li><strong>Approval Mode:</strong> Interactive recommendations requiring explicit human one-click authorization prior to any action execution.</li>
            <li><strong>Autonomous Mode:</strong> Automated execution of pre-defined capacity scaling within strict customer-configured guardrails.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">3. Customer Infrastructure & Authorization</h2>
          <p>
            You authorize CloudFlip to access your connected cloud accounts solely through least-privilege IAM roles or credentials you explicitly provide. You retain full ownership, control, and governance over your cloud infrastructure and may revoke CloudFlip’s IAM permissions at any time via your cloud provider console.
          </p>
        </section>

        {/* Section 4: Security, Human Verification & Anti-Abuse */}
        <section className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h2 className="font-display font-bold text-[18px] text-slate-900 flex items-center gap-2">
            <span>🛡️</span> 4. Acceptable Use, Security Verification & Anti-Bot Protection
          </h2>
          <p className="text-[13.5px]">
            To protect platform stability, uptime, and user privacy, CloudFlip enforces automated bot protection, human verification challenges, and rate limiting. You agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[13px] mt-2">
            <li>Bypass, spoof, or tamper with CloudFlip Shield or Cloudflare Turnstile human verification challenges.</li>
            <li>Deploy automated scripts, bots, spiders, or scrapers against any CloudFlip endpoints or user interfaces.</li>
            <li>Engage in credential stuffing, brute-force password guessing, or distributed denial of service (DDoS) attempts.</li>
            <li>Decompile, reverse-engineer, or attempt to derive underlying predictive models or telemetry aggregation algorithms without authorization.</li>
          </ul>
          <p className="text-[12.5px] text-slate-500 mt-2">
            Violation of these provisions will result in immediate termination of account access and IP-level firewall enforcement.
          </p>
        </section>

        {/* Section 5: Cookies and Tracking Consent */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">5. Cookies & Local Storage Technologies</h2>
          <p>
            CloudFlip utilizes essential cookies and browser storage to maintain secure authentication tokens and anti-bot verification, as well as optional analytics cookies to measure application responsiveness. By using the platform, you acknowledge our cookie practices as outlined in our{" "}
            <Link to="/cookies" className="text-sky-600 font-semibold hover:underline">
              Cookie Policy
            </Link>
            . You may adjust your choices at any time via the{" "}
            <button
              type="button"
              onClick={openCookiePreferences}
              className="text-sky-600 font-semibold underline"
            >
              Cookie Preferences
            </button>{" "}
            manager.
          </p>
        </section>

        <section className="space-y-3 bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-950">
          <h2 className="font-display font-bold text-[18px] text-amber-900">6. Limitation of Liability & Caps</h2>
          <p className="text-[13px] leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CLOUDFLIP, ITS AFFILIATES, OFFICERS, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, DATA, SYSTEM DOWNTIME, OR THIRD-PARTY CLOUD PROVIDER CHARGES (INCLUDING AWS BILLING) ARISING OUT OF THE USE OR INABILITY TO USE THE SERVICE.
          </p>
          <p className="text-[13px] leading-relaxed mt-2">
            IN NO EVENT SHALL CLOUDFLIP'S AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO CLOUDFLIP IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">7. Subscription & Payment Terms</h2>
          <p>
            CloudFlip offers subscription plans (Monthly at $99/mo, Annual at $990/yr) and metered Pay-As-You-Go pricing. Subscriptions are billed in advance on a recurring basis and can be canceled at any time prior to the subsequent billing cycle.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">8. Security & Vulnerability Reporting</h2>
          <p>
            CloudFlip adheres to coordinated vulnerability disclosure. If you identify a potential security issue in CloudFlip’s applications or infrastructure, please contact our security response team at{" "}
            <a href="mailto:bhavyasriofficial16@gmail.com" className="text-sky-600 underline">
              bhavyasriofficial16@gmail.com
            </a>{" "}
            with technical details.
          </p>
        </section>

        <section className="space-y-3 pt-2">
          <h2 className="font-display font-bold text-[18px] text-slate-900">9. Contact Information</h2>
          <p>
            For legal inquiries, dispute resolution, or contractual questions, contact our legal team at{" "}
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
            <Link to="/privacy" className="hover:text-slate-800">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-slate-800">Cookie Policy</Link>
            <button type="button" onClick={openCookiePreferences} className="hover:text-slate-800 underline">
              Cookie Preferences
            </button>
            <Link to="/security" className="hover:text-slate-800">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
