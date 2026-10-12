import { supabase, isSupabaseConfigured } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...headers, ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string; mode: string }>("/api/health"),
  resources: () => request<any[]>("/api/resources"),
  dependencies: () => request<any[]>("/api/dependencies"),
  metrics: (scenario = "normal", points = 30) =>
    request<any>(`/api/metrics?scenario=${scenario}&points=${points}`),
  predictions: (horizon = 30, scenario = "sudden_surge") =>
    request<any>(`/api/predictions?horizon_minutes=${horizon}&scenario=${scenario}`),
  anomalies: (scenario = "sudden_surge") =>
    request<any>(`/api/anomalies?scenario=${scenario}`),
  bottlenecks: () => request<any[]>("/api/bottlenecks"),
  runSimulation: (payload: {
    traffic_multiplier: number;
    horizon_minutes: number;
    current_instances: number;
  }) =>
    request<any>("/api/simulations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  recommendations: () => request<any[]>("/api/recommendations"),
  approveRecommendation: (id: string) =>
    request<any>(`/api/recommendations/${id}/approve`, { method: "POST" }),
  rejectRecommendation: (id: string) =>
    request<any>(`/api/recommendations/${id}/reject`, { method: "POST" }),
  actions: () => request<any[]>("/api/actions"),
  costCompare: () => request<any[]>("/api/cost/compare"),
  activity: () => request<any[]>("/api/activity"),
  plans: () => request<any[]>("/api/billing/plans"),
  subscription: () => request<any>("/api/billing/subscription"),
  startCheckout: (planId: string) =>
    request<{ checkout_url: string }>(`/api/billing/checkout-session?plan_id=${planId}`, { method: "POST" }),
  openBillingPortal: () => request<{ portal_url: string }>("/api/billing/portal-session", { method: "POST" }),
  createRazorpayOrder: (planId: string) =>
    request<any>("/api/billing/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId }),
    }),
  verifyRazorpayPayment: (payload: {
    plan_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    request<any>("/api/billing/razorpay/verify-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  triggerAutonomousSweep: () =>
    request<any>("/api/agent/trigger-sweep", { method: "POST" }),
  getAgentPolicy: () => request<any>("/api/agent/policy"),
  updateAgentPolicy: (payload: {
    auto_remediation_mode: string;
    confidence_threshold: number;
    max_cost_impact: number;
  }) =>
    request<any>("/api/agent/policy", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAWSStatus: () => request<any>("/api/settings/aws"),
  connectAWS: (payload: { role_arn?: string; access_key_id?: string; secret_access_key?: string; region: string }) =>
    request<any>("/api/settings/aws", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAzureStatus: () => request<any>("/api/settings/azure"),
  connectAzure: (payload: { subscription_id: string; tenant_id?: string; client_id?: string; client_secret?: string; resource_group?: string; region?: string }) =>
    request<any>("/api/settings/azure", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  setSafetyMode: (simulation_only_mode: boolean) =>
    request<any>("/api/settings/safety-mode", {
      method: "POST",
      body: JSON.stringify({ simulation_only_mode }),
    }),
  discoverAWS: () => request<any>("/api/aws/discover", { method: "POST" }),
  getCloudFormationTemplate: () => request<any>("/api/settings/cloudformation/template"),
  getCloudFormationQuickLaunch: (region: string = "ap-south-1", externalId?: string) =>
    request<any>(`/api/settings/cloudformation/quick-launch?region=${encodeURIComponent(region)}${externalId ? `&external_id=${encodeURIComponent(externalId)}` : ""}`),
  getDaemonStatus: () => request<any>("/api/daemon/status"),
  startDaemon: () => request<any>("/api/daemon/start", { method: "POST" }),
  stopDaemon: () => request<any>("/api/daemon/stop", { method: "POST" }),
  triggerDaemonSweep: () => request<any>("/api/daemon/trigger", { method: "POST" }),
};

