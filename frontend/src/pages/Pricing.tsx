import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import CloudFlipLogo from "../components/CloudFlipLogo";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SKYDO_LINKS: Record<string, string> = {
  pro_monthly: "https://dashboard.skydo.com/pay/pyl_Mq6TLV",
  pro_annual: "https://dashboard.skydo.com/pay/pyl_2RJ0Dz",
  pay_as_you_go: "https://dashboard.skydo.com/pay/pyl_aXN9Hm",
};

const DEFAULT_PLANS = [
  {
    id: "free",
    name: "Free / Starter",
    target_customer: "Developers & Testers",
    price_inr: "₹0",
    price_usd: "$0",
    price_display: "$0",
    features: [
      "Simulator only (up to 3 resources)",
      "Gets users hooked on the product",
      "No real AWS connection required",
      "Basic metrics & dashboard",
    ],
    cta: "Start free",
  },
  {
    id: "pay_as_you_go",
    name: "Pay-As-You-Go",
    target_customer: "Small Teams & Variable Workloads",
    price_inr: "₹25 / resource-hr",
    price_usd: "$0.30 / resource-hr",
    price_display: "$0.30 / resource-hr (₹25/hr)",
    features: [
      "Zero friction to start",
      "Scales automatically with client growth",
      "No monthly commitment",
      "Full Pro features & metrics",
    ],
    cta: "Start Pay-As-You-Go",
  },
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    target_customer: "Growing Companies",
    price_inr: "₹7,999 / mo",
    price_usd: "$99 / mo",
    price_display: "$99 / mo (₹7,999/mo)",
    features: [
      "Predictable MRR (Monthly Recurring Revenue)",
      "Real AWS & Multi-Cloud connection",
      "Predictions, anomalies & simulator",
      "Manual & autonomous AI remediation",
    ],
    cta: "Start Pro Monthly",
  },
  {
    id: "pro_annual",
    name: "Pro Annual",
    target_customer: "Established Businesses",
    price_inr: "₹79,990 / yr",
    price_usd: "$990 / yr",
    price_display: "$990 / yr (2 months free)",
    badge: "2 months free",
    features: [
      "Upfront annual cash flow & lower churn",
      "Everything in Pro Monthly",
      "2 months free included",
      "Priority SRE support & SLA",
    ],
    cta: "Start Pro Annual",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    target_customer: "Large Scale Infrastructure",
    price_inr: "Custom Quote",
    price_usd: "Custom / Quote",
    price_display: "Custom / Quote",
    badge: "Custom SLA",
    features: [
      "SLA guarantee",
      "Custom guardrails & policy engine",
      "Dedicated solution architect",
      "Unlimited AWS & Azure accounts",
    ],
    cta: "Contact Sales",
  },
];

export default function Pricing() {
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [region, setRegion] = useState<"IN" | "GLOBAL">("GLOBAL"); // Default International / USD
  const [busy, setBusy] = useState<string | null>(null);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Background sync with API catalog without blocking initial paint
    api.plans().then((remotePlans) => {
      if (remotePlans && remotePlans.length > 0) setPlans(remotePlans);
    }).catch(() => {});

    // Ensure Razorpay Checkout SDK is ready
    if (!document.getElementById("razorpay-sdk") && typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const choose = async (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:bhavyasriofficial16@gmail.com?subject=CloudFlip%20Enterprise%20Inquiry";
      return;
    }
    if (planId === "free") {
      navigate(session ? "/app" : "/signup");
      return;
    }

    // Direct 1-click international checkout via Skydo
    if (region === "GLOBAL" && SKYDO_LINKS[planId]) {
      window.open(SKYDO_LINKS[planId], "_blank");
      return;
    }

    if (!session) {
      navigate("/signup?next=pricing");
      return;
    }

    setBusy(planId);

    if (region === "IN") {
      // --- Razorpay Payment Flow (India) ---
      try {
        const orderData = await api.createRazorpayOrder(planId);

        if (orderData.is_demo) {
          // Demo mode fallback — verify directly
          await api.verifyRazorpayPayment({
            plan_id: planId,
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_signature: "demo_sig",
          });
          alert(`Successfully subscribed to ${orderData.plan_name} via Razorpay (Demo Mode)!`);
          navigate("/app?checkout=success");
          return;
        }

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "CloudFlip",
          description: `Subscription for ${orderData.plan_name}`,
          order_id: orderData.order_id,
          handler: async function (response: any) {
            try {
              await api.verifyRazorpayPayment({
                plan_id: planId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              navigate("/app?checkout=success");
            } catch (err: any) {
              alert("Payment verification failed: " + err.message);
            }
          },
          prefill: {
            email: session.user?.email || "",
          },
          theme: {
            color: "#4FD1E8",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (e: any) {
        alert("Razorpay checkout initialization failed: " + e.message);
      } finally {
        setBusy(null);
      }
    } else {
      // --- International Payment Flow (Skydo USD) ---
      if (SKYDO_LINKS[planId]) {
        window.open(SKYDO_LINKS[planId], "_blank");
        setBusy(null);
        return;
      }
      window.open(SKYDO_LINKS.pro_monthly, "_blank");
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/90 border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <CloudFlipLogo size={28} />
          </Link>
          <Link to="/app" className="bg-[#4FD1E8] text-[#04141A] font-semibold text-[14px] rounded-md px-4 py-2 hover:bg-[#3ec4db] transition-colors shadow-xs">
            {session ? "Go to dashboard" : "Try the demo"}
          </Link>
        </div>
      </header>

      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="text-sky-600 text-[13px] font-semibold mb-2">Pricing & Packages</div>
            <h1 className="font-display font-bold text-[30px] sm:text-[36px] text-slate-900 max-w-[560px]">
              Simple, transparent pricing.
            </h1>
          </div>

          {/* Region / Currency Switcher */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
            <button
              onClick={() => setRegion("IN")}
              className={`px-3 py-1.5 text-[12.5px] sm:text-[13px] font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                region === "IN" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🇮🇳</span> India (Razorpay - INR ₹)
            </button>
            <button
              onClick={() => setRegion("GLOBAL")}
              className={`px-3 py-1.5 text-[12.5px] sm:text-[13px] font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                region === "GLOBAL" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🌎</span> International (Stripe - USD $)
            </button>
          </div>
        </div>


        <p className="text-slate-600 text-[16px] max-w-[540px] mb-12">
          Start free on the playground. Connect a real AWS account whenever you're ready.
        </p>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-xl border p-5 flex flex-col justify-between transition-all ${
                p.badge
                  ? "border-sky-300 bg-gradient-to-b from-sky-50/70 to-white shadow-sm"
                  : "border-slate-200 bg-white shadow-xs"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-4 text-[10px] font-bold bg-[#4FD1E8] text-[#04141A] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {p.badge}
                </span>
              )}
              <div>
                <h3 className="font-display font-bold text-[16px] text-slate-900 mb-1">{p.name}</h3>
                {p.target_customer && (
                  <div className="text-[11.5px] font-medium text-sky-600 mb-3 bg-sky-50 inline-block px-2 py-0.5 rounded-md border border-sky-100">
                    {p.target_customer}
                  </div>
                )}
                <div className="font-mono text-[18px] font-bold text-slate-900 mb-5">
                  {region === "IN" ? p.price_inr || p.price_display : p.price_usd || p.price_display}
                </div>

                <ul className="flex flex-col gap-2 mb-6">
                  {p.features.map((f: string) => (
                    <li key={f} className="text-[12.5px] text-slate-600 flex items-start gap-1.5">
                      <span className="text-sky-500 font-bold shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => choose(p.id)}
                disabled={busy === p.id}
                className={`w-full rounded-md py-2.5 text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${
                  p.badge
                    ? "bg-[#4FD1E8] text-[#04141A] hover:bg-[#3ec4db] shadow-xs"
                    : "border border-slate-300 text-slate-800 hover:bg-slate-50"
                } ${busy === p.id ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {busy === p.id ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Opening Checkout…</span>
                  </>
                ) : (
                  p.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Gating & Strategic Matrix Comparison Table */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h3 className="font-display font-bold text-[22px] text-slate-900 mb-6">Pricing Matrix & Business Value</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden text-[13.5px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-display font-semibold text-slate-900">
                  <th className="p-3.5">Model</th>
                  <th className="p-3.5">Target Customer</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Why It Works</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900">Free / Starter</td>
                  <td className="p-3.5 text-slate-600">Developers & Testers</td>
                  <td className="p-3.5 font-mono">$0 (up to 3 resources, simulator only)</td>
                  <td className="p-3.5 font-medium text-emerald-700 bg-emerald-50/50">Gets users hooked on the product.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900">Pay-As-You-Go</td>
                  <td className="p-3.5 text-slate-600">Small Teams & Variable Workloads</td>
                  <td className="p-3.5 font-mono">$0.30 / resource-hour (₹25/hr)</td>
                  <td className="p-3.5 font-medium text-sky-700 bg-sky-50/50">Zero friction to start, scales with client growth.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900">Pro Monthly</td>
                  <td className="p-3.5 text-slate-600">Growing Companies</td>
                  <td className="p-3.5 font-mono">$99 / mo (₹7,999/mo)</td>
                  <td className="p-3.5 font-medium text-purple-700 bg-purple-50/50">Predictable MRR (Monthly Recurring Revenue).</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900">Pro Annual</td>
                  <td className="p-3.5 text-slate-600">Established Businesses</td>
                  <td className="p-3.5 font-mono">$990 / yr (2 months free)</td>
                  <td className="p-3.5 font-medium text-amber-700 bg-amber-50/50">Upfront annual cash flow & lower churn.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900">Enterprise</td>
                  <td className="p-3.5 text-slate-600">Large Scale Infrastructure</td>
                  <td className="p-3.5 font-mono">Custom / Quote</td>
                  <td className="p-3.5 font-medium text-indigo-700 bg-indigo-50/50">SLA guarantee, custom guardrails & dedicated support.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[12.5px] text-slate-500 mt-8">
          {region === "IN"
            ? "Indian payments are processed securely via Razorpay supporting UPI, Cards, Netbanking, and Wallets in INR ₹."
            : "International payments are processed via Stripe subscription & metered billing supporting Cards, Apple Pay, and Google Pay in USD $."}
        </p>
      </section>
    </div>
  );
}
