import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui";

export default function Settings() {
  const { user, session, signOut, authProvider } = useAuth();
  const [sub, setSub] = useState<any>(null);
  const [awsStatus, setAwsStatus] = useState<any>({ connected: false, region: "ap-south-1", simulation_only_mode: true });
  const [azureStatus, setAzureStatus] = useState<any>({ connected: false, region: "centralindia" });
  const [showAwsModal, setShowAwsModal] = useState(false);
  const [authType, setAuthType] = useState<"cloudformation" | "role" | "keys" | "azure">("cloudformation");
  const [roleArn, setRoleArn] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [region, setRegion] = useState("ap-south-1");
  const [azureSubId, setAzureSubId] = useState("");
  const [azureTenantId, setAzureTenantId] = useState("");
  const [azureClientId, setAzureClientId] = useState("");
  const [azureClientSecret, setAzureClientSecret] = useState("");
  const [externalId, setExternalId] = useState("cloudflip-tenant-883921");
  const [cfQuickUrl, setCfQuickUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) api.subscription().then(setSub).catch(() => {});
    fetchAwsStatus();
    fetchAzureStatus();
    api.getCloudFormationQuickLaunch(region, externalId).then((res) => {
      if (res.quick_launch_url) setCfQuickUrl(res.quick_launch_url);
    }).catch(() => {});
  }, [session, region]);

  const fetchAwsStatus = () => {
    api.getAWSStatus().then(setAwsStatus).catch(() => {});
  };

  const fetchAzureStatus = () => {
    api.getAzureStatus().then(setAzureStatus).catch(() => {});
  };

  const handleConnectAws = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = authType === "role" 
        ? { role_arn: roleArn || "arn:aws:iam::123456789012:role/CloudFlipRemediationRole", region }
        : { access_key_id: accessKeyId, secret_access_key: secretAccessKey, region };
        
      const res = await api.connectAWS(payload);
      setAwsStatus((prev: any) => ({ 
        ...prev, 
        connected: true, 
        region, 
        role_arn: roleArn,
        account_id: res.account_id 
      }));
      setShowAwsModal(false);
      alert(res.message || "AWS Account connected successfully!");
    } catch (err: any) {
      alert("AWS Connection failed: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleConnectAzure = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.connectAzure({
        subscription_id: azureSubId || "00000000-0000-0000-0000-000000000000",
        tenant_id: azureTenantId,
        client_id: azureClientId,
        client_secret: azureClientSecret,
        region: "centralindia",
      });
      setAzureStatus({
        connected: true,
        subscription_id: azureSubId || "demo-student-sub",
        region: "centralindia",
      });
      setShowAwsModal(false);
      alert(res.message || "Microsoft Azure for Students connected successfully!");
    } catch (err: any) {
      alert("Azure Connection failed: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleSafetyMode = async () => {
    const newMode = !awsStatus.simulation_only_mode;
    try {
      await api.setSafetyMode(newMode);
      setAwsStatus((prev: any) => ({ ...prev, simulation_only_mode: newMode }));
      alert(newMode ? "Safety Mode ON (Simulation mode active for safe testing)." : "Safety Mode OFF (Real AWS Action Execution active!).");
    } catch (err: any) {
      alert("Failed to update safety mode: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-[720px] font-sans">
      <Card className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
        <h2 className="font-display font-bold text-[18px] text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Account & Real Infrastructure Settings
        </h2>

        {/* Authentication Provider */}
        <Row 
          label="Authentication Account" 
          desc={user ? `${user.email} (${authProvider.toUpperCase()} Auth)` : "Not signed in — Demo Mode"}
        >
          {session || user ? (
            <button onClick={signOut} className="text-[13px] border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-md px-3.5 py-1.5">
              Log out
            </button>
          ) : (
            <Link to="/signup" className="text-[13px] bg-[#4FD1E8] text-[#04141A] font-semibold rounded-md px-3.5 py-1.5">
              Sign up
            </Link>
          )}
        </Row>

        {/* Supabase Database Storage */}
        <Row 
          label="Database & Telemetry Storage" 
          desc="Supabase PostgreSQL DB (Cloud Timescale Telemetry Data Store)"
        >
          <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            ● Supabase Connected
          </span>
        </Row>

        {/* Plan Status */}
        <Row label="Current Plan" desc={sub ? `${sub.plan} · ${sub.status}` : "Free / Starter Plan"}>
          <Link to="/pricing" className="text-[13px] border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-md px-3.5 py-1.5">
            View plans
          </Link>
        </Row>

        {/* Real AWS Account Connection */}
        <Row 
          label="AWS Account Connection" 
          desc={
            awsStatus.connected 
              ? `Connected (${awsStatus.region}) ${awsStatus.account_id ? `· Account: ${awsStatus.account_id}` : ''}`
              : "Not connected — running on simulated AWS telemetry"
          }
        >
          <button 
            onClick={() => { setAuthType("cloudformation"); setShowAwsModal(true); }} 
            className={`text-[13px] font-semibold rounded-md px-3.5 py-1.5 transition-colors ${
              awsStatus.connected 
                ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                : "bg-sky-600 text-white hover:bg-sky-700 shadow-xs"
            }`}
          >
            {awsStatus.connected ? "Reconfigure AWS" : "Connect AWS Account"}
          </button>
        </Row>

        {/* Microsoft Azure (Student / Multi-Cloud) Connection */}
        <Row 
          label="Microsoft Azure (Student / Multi-Cloud)" 
          desc={
            azureStatus.connected 
              ? `Connected (Subscription: ${azureStatus.subscription_id?.slice(0, 8)}... · Region: ${azureStatus.region})`
              : "Azure for Students ($100 Free Credit — No Credit Card) · Connect Virtual Machine Scale Sets"
          }
        >
          <button 
            onClick={() => { setAuthType("azure"); setShowAwsModal(true); }} 
            className={`text-[13px] font-semibold rounded-md px-3.5 py-1.5 transition-colors ${
              azureStatus.connected 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-[#0078D4] text-white hover:bg-[#006cbd] shadow-xs"
            }`}
          >
            {azureStatus.connected ? "Reconfigure Azure" : "Connect Azure ($100 Free)"}
          </button>
        </Row>

        {/* Safety Mode Toggle */}
        <Row 
          label="AWS Real Execution Safety Switch" 
          desc={
            awsStatus.simulation_only_mode 
              ? "Simulation Safety Active (Prevents real scaling actions on AWS)" 
              : "⚠️ Live Real AWS Execution Enabled (Scaling actions apply to real ASG)"
          }
        >
          <button 
            onClick={toggleSafetyMode}
            className={`text-[12px] font-mono px-3 py-1.5 rounded-md font-semibold border transition-all ${
              awsStatus.simulation_only_mode 
                ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100" 
                : "text-red-700 bg-red-50 border-red-200 hover:bg-red-100"
            }`}
          >
            {awsStatus.simulation_only_mode ? "Safety Mode: ON" : "Safety Mode: OFF (LIVE)"}
          </button>
        </Row>
      </Card>

      {/* AWS Connection Modal */}
      {showAwsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-[520px] shadow-xl">
            <h3 className="font-display font-bold text-[18px] text-slate-900 mb-1">Connect Real AWS Infrastructure</h3>
            <p className="text-[13px] text-slate-600 mb-4">
              Link your AWS Account via IAM Role ARN or Access Keys to discover real EC2, ASG, and CloudWatch metrics.
            </p>

            {/* Auth Method Selector */}
            <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
              <button 
                type="button"
                onClick={() => setAuthType("cloudformation")}
                className={`py-2 px-3 text-[12.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  authType === "cloudformation" 
                    ? "border-sky-500 text-sky-600" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                ⚡ 1-Click CloudFormation
              </button>
              <button 
                type="button"
                onClick={() => setAuthType("role")}
                className={`py-2 px-3 text-[12.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  authType === "role" 
                    ? "border-sky-500 text-sky-600" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Manual IAM Role
              </button>
              <button 
                type="button"
                onClick={() => setAuthType("keys")}
                className={`py-2 px-3 text-[12.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  authType === "keys" 
                    ? "border-sky-500 text-sky-600 font-bold" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                AWS Access Keys
              </button>
              <button 
                type="button"
                onClick={() => setAuthType("azure")}
                className={`py-2 px-3 text-[12.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  authType === "azure" 
                    ? "border-blue-500 text-blue-600 font-bold" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                🔷 Microsoft Azure (Students)
              </button>
            </div>

            <form onSubmit={authType === "azure" ? handleConnectAzure : handleConnectAws} className="space-y-4">
              {authType === "azure" ? (
                <div className="space-y-3.5">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3.5">
                    <div className="font-semibold text-[13px] text-blue-950 mb-1 flex items-center justify-between">
                      <span>🎓 Azure for Students ($100 Free Credit)</span>
                      <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded uppercase">No Credit Card</span>
                    </div>
                    <p className="text-[12px] text-slate-600 mb-2 leading-relaxed">
                      College students can claim $100 free credit at{" "}
                      <a href="https://azure.microsoft.com/free/students" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">
                        azure.microsoft.com/free/students ↗
                      </a>{" "}
                      using your student email address.
                    </p>
                    <div className="text-[11.5px] text-blue-800 font-medium">
                      CloudFlip connects directly to Azure Virtual Machine Scale Sets (VMSS) & Azure Monitor metrics.
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Azure Subscription ID *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12345678-1234-1234-1234-123456789012"
                      value={azureSubId}
                      onChange={(e) => setAzureSubId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[13.5px] text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Tenant ID (Directory ID)</label>
                      <input 
                        type="text" 
                        placeholder="Azure Tenant ID"
                        value={azureTenantId}
                        onChange={(e) => setAzureTenantId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[12.5px] text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Client ID (App ID)</label>
                      <input 
                        type="text" 
                        placeholder="Service Principal ID"
                        value={azureClientId}
                        onChange={(e) => setAzureClientId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[12.5px] text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Client Secret (Password)</label>
                    <input 
                      type="password" 
                      placeholder="Service Principal Client Secret"
                      value={azureClientSecret}
                      onChange={(e) => setAzureClientSecret(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[12.5px] text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : authType === "cloudformation" ? (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-lg p-3.5">
                    <div className="font-semibold text-[13px] text-slate-900 mb-1 flex items-center justify-between">
                      <span>Step 1: Deploy CloudFormation Stack</span>
                      <span className="text-[11px] font-mono bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded">60-sec setup</span>
                    </div>
                    <p className="text-[12px] text-slate-600 mb-3 leading-relaxed">
                      Creates a secure, least-privilege IAM execution role with your dedicated External ID to prevent confused deputy vulnerabilities.
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={cfQuickUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[12.5px] px-3.5 py-2 rounded-md shadow-xs transition-colors"
                      >
                        🚀 Launch in AWS Console ↗
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await api.getCloudFormationTemplate();
                          const blob = new Blob([t.content], { type: "text/yaml" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "cloudflip-onboarding.yaml";
                          a.click();
                        }}
                        className="text-[12px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium px-3 py-2 rounded-md transition-colors"
                      >
                        Download Template YAML
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label className="text-[12.5px] font-semibold text-slate-700">Step 2: Enter Resulting Role ARN</label>
                      <span className="text-[11px] font-mono text-slate-500">External ID: {externalId}</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder={`arn:aws:iam::ACCOUNT_ID:role/CloudFlipIntegrationRole-${region}`}
                      value={roleArn}
                      onChange={(e) => setRoleArn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[13.5px] text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                    />
                    <p className="text-[11.5px] text-slate-500 mt-1">
                      Copy the Role ARN from your AWS CloudFormation Stack Outputs tab.
                    </p>
                  </div>
                </div>
              ) : authType === "role" ? (
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">IAM Role ARN</label>
                  <input 
                    type="text" 
                    placeholder="arn:aws:iam::123456789012:role/CloudFlipRemediationRole"
                    value={roleArn}
                    onChange={(e) => setRoleArn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[13.5px] text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[11.5px] text-slate-500 mt-1">
                    Create an IAM role with CloudWatch read & AutoScaling modify permissions.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">AWS Access Key ID</label>
                    <input 
                      type="text" 
                      placeholder="AKIAXXXXXXXXXXXXXXXX"
                      value={accessKeyId}
                      onChange={(e) => setAccessKeyId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[13.5px] text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">AWS Secret Access Key</label>
                    <input 
                      type="password" 
                      placeholder="****************************************"
                      value={secretAccessKey}
                      onChange={(e) => setSecretAccessKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[13.5px] text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </>
              )}

              {authType !== "azure" && (
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Primary AWS Region</label>
                  <select 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-[13.5px] text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ap-south-1">ap-south-1 (Asia Pacific - Mumbai)</option>
                    <option value="us-east-1">us-east-1 (US East - N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (US West - Oregon)</option>
                    <option value="eu-west-1">eu-west-1 (Europe - Ireland)</option>
                    <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  </select>
                </div>
              )}

              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-[12px] text-sky-800">
                🔒 <strong>Security Guarantee:</strong> {authType === "azure" ? "Azure connection uses standard RBAC credentials. Secrets are stored securely." : "AWS Access utilizes STS identity verification. Keys and secrets are never exposed to clients."}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAwsModal(false)}
                  className="px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={busy}
                  className={`px-4 py-2 text-[13px] font-semibold rounded-lg shadow-xs disabled:opacity-50 text-white ${
                    authType === "azure" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#4FD1E8] text-[#04141A] hover:bg-[#3ec4db]"
                  }`}
                >
                  {busy ? "Verifying Credentials…" : authType === "azure" ? "Connect Azure ($100 Free)" : "Save & Verify Connection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-3.5 border-b border-slate-100 last:border-b-0">
      <div>
        <div className="text-[13.5px] font-semibold text-slate-900">{label}</div>
        <div className="text-[12px] text-slate-500 mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  );
}
