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
            Last updated: November 1, 2026 · CloudFlip Global Platform Terms
          </p>
        </div>

        {/* Section 1: Entity & Acceptance */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">1. Acceptance of Terms & Legal Entity</h2>
          <p>
            By accessing or using CloudFlip ("Service", "we", "us", or "Platform"), you agree to be bound by these Terms of Service. CloudFlip is currently founded, owned, and operated by Bhavya Sri Boddeti (trading as CloudFlip / CloudFlip Systems, based in Visakhapatnam, Andhra Pradesh, India).
          </p>
          <p>
            If you are entering into these terms on behalf of a company, organization, or entity, you represent and warrant that you have the authority to bind that entity to these Terms. If you do not have such authority, or if you do not agree with these Terms, you must not access or use the Service.
          </p>
        </section>

        {/* Section 2: Operating Modes */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">2. Description of Service & Operational Modes</h2>
          <p>
            CloudFlip provides predictive cloud infrastructure telemetry, capacity simulation, and automated remediation recommendations. To guarantee full customer control and safety, the Platform operates in three distinct modes:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Shadow Mode (Default):</strong> Passive observation and log-only forecasting. The CloudFormation onboarding template deploys with <code>EnableAutonomousRemediation: false</code> by default, granting CloudFlip <strong>100% read-only access with zero write permissions</strong>. In Shadow Mode, CloudFlip is structurally incapable of altering your infrastructure.
            </li>
            <li>
              <strong>Approval Mode:</strong> Interactive recommendations requiring explicit human one-click authorization in the dashboard prior to executing any capacity change.
            </li>
            <li>
              <strong>Autonomous Mode:</strong> Automated execution of pre-defined Auto Scaling adjustments strictly bounded by customer-configured guardrails, maximum scale factors, anti-flapping cooldown windows, and automated post-action verification.
            </li>
          </ul>
        </section>

        {/* Section 3: Customer Infrastructure & Disconnection */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">3. Customer Infrastructure, Authorization & Disconnection</h2>
          <p>
            You authorize CloudFlip to access your connected cloud accounts solely through least-privilege IAM roles or credentials you explicitly configure. You retain full ownership, control, and governance over your cloud infrastructure.
          </p>
          <p>
            <strong>Disconnection & Revocation:</strong> You may revoke CloudFlip’s IAM permissions at any time via your AWS Management Console by deleting the integration role or stack. Upon disconnection or account termination:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13.5px]">
            <li>CloudFlip immediately halts all telemetry polling and API calls.</li>
            <li>Stored IAM Role ARNs and external identifiers are purged from active configurations within <strong>24 hours</strong>.</li>
            <li>Historical telemetry aggregations and simulation caches are permanently erased within <strong>14 calendar days</strong>.</li>
          </ul>
        </section>

        {/* Section 4: Acceptable Use & API Access */}
        <section className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h2 className="font-display font-bold text-[18px] text-slate-900 flex items-center gap-2">
            <span>🛡️</span> 4. Acceptable Use, Security Verification & API Access
          </h2>
          <p className="text-[13.5px]">
            To protect platform stability, uptime, and user data, CloudFlip enforces automated bot protection, human verification challenges, and rate limiting. You agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[13px] mt-2">
            <li>Bypass, spoof, or tamper with CloudFlip Shield or Cloudflare Turnstile human verification challenges.</li>
            <li>
              Deploy unauthorized automated scripts, credential scrapers, or DDoS bots against CloudFlip endpoints or user interfaces. <em>(Note: This prohibition does not restrict legitimate authorized programmatic access via your customer API tokens, webhooks, or documented integration endpoints).</em>
            </li>
            <li>Engage in credential stuffing, brute-force password guessing, or distributed denial of service attempts.</li>
            <li>Decompile, reverse-engineer, or attempt to derive underlying predictive models or telemetry aggregation algorithms without written authorization.</li>
          </ul>
          <p className="text-[12.5px] text-slate-500 mt-2">
            Unauthorized malicious abuse will result in immediate termination of account access and IP-level firewall enforcement.
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

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-3 bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-950">
          <h2 className="font-display font-bold text-[18px] text-amber-900">6. Limitation of Liability & Caps</h2>
          <p className="text-[13px] leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CLOUDFLIP, ITS AFFILIATES, OPERATORS, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, DATA, SYSTEM DOWNTIME, OR THIRD-PARTY CLOUD PROVIDER CHARGES (INCLUDING AWS COMPUTE BILLING) ARISING OUT OF THE USE OR INABILITY TO USE THE SERVICE.
          </p>
          <p className="text-[13px] leading-relaxed mt-2">
            IN NO EVENT SHALL CLOUDFLIP'S AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO CLOUDFLIP IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        {/* Section 7: Subscription, Pricing & Refund Policy */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">7. Subscription Tiers, Payment & Refund Policy</h2>
          <p>
            CloudFlip offers tiered plans designed for individuals, growing teams, and enterprises:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] pt-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong>Free Tier ($0/mo):</strong> Up to 3 simulated resources; no AWS credentials required.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong>Pay-As-You-Go ($0.30 / res-hr):</strong> Metered billing with no minimum monthly commitment.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong>Pro Monthly ($99/mo):</strong> Live AWS connection, predictive alerts, up to 25 resources.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong>Pro Annual ($990/yr):</strong> Everything in Pro with 2 months free and 12-month price lock.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong>Team ($499/mo):</strong> Up to 100 resources, custom guardrails, and audit logging.
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong>Enterprise (Custom):</strong> Multi-account AWS Organizations, custom SLAs, and dedicated DPAs.
            </div>
          </div>
          <p className="text-[13.5px] pt-2">
            <strong>Refund Policy:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13px]">
            <li>Subscriptions are billed in advance on a recurring monthly or annual basis. You may cancel at any time to prevent subsequent renewals; cancellations take effect at the end of the paid billing period.</li>
            <li>For annual and team subscription plans, CloudFlip provides a <strong>14-day refund guarantee</strong> from the initial purchase date if the platform fails to perform to documented specifications and our support team cannot remediate the issue within 7 business days.</li>
            <li>Metered Pay-As-You-Go charges are non-refundable once telemetry data has been ingested and analyzed.</li>
          </ul>
        </section>

        {/* Section 8: Security & Vulnerability Reporting */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">8. Security & Vulnerability Reporting</h2>
          <p>
            CloudFlip adheres to coordinated vulnerability disclosure under RFC 9116. If you identify a potential security vulnerability in CloudFlip’s applications or infrastructure, please review our policy at{" "}
            <Link to="/security" className="text-sky-600 underline">
              cloudflip.me/security
            </Link>{" "}
            and contact our security team at{" "}
            <a href="mailto:security@cloudflip.me" className="text-sky-600 font-semibold underline">
              security@cloudflip.me
            </a>
            . Our public security disclosure policy is published at{" "}
            <a href="/.well-known/security.txt" target="_blank" className="font-mono text-sky-600 underline text-[12.5px]">
              /.well-known/security.txt
            </a>.
          </p>
        </section>

        {/* Section 9: Governing Law & Dispute Resolution */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">9. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms shall be instituted exclusively in the competent courts located in Visakhapatnam, Andhra Pradesh, India.
          </p>
          <p className="text-[13px] text-slate-500">
            <em>Enterprise Note:</em> For enterprise customers executing customized enterprise order forms or Data Processing Agreements (DPAs), governing law and venue may be mutually agreed in writing (including the State of Delaware, United States).
          </p>
        </section>

        {/* Section 10: Legal Contact */}
        <section className="space-y-3 pt-2">
          <h2 className="font-display font-bold text-[18px] text-slate-900">10. Contact Information</h2>
          <p>
            For legal inquiries, enterprise vendor paperwork, or dispute resolution, contact our legal counsel at{" "}
            <a href="mailto:legal@cloudflip.me" className="text-sky-600 font-semibold underline">
              legal@cloudflip.me
            </a>. For privacy and data protection inquiries, contact{" "}
            <a href="mailto:privacy@cloudflip.me" className="text-sky-600 font-semibold underline">
              privacy@cloudflip.me
            </a>.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 bg-slate-50/70 text-slate-500 text-[12px] mt-12">
        <div className="max-w-[840px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 CloudFlip Platform. Operated by Bhavya Sri Boddeti. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-800">Privacy Policy</Link>
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
