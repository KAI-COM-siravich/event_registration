"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { Copy, CheckCircle2, Webhook, Loader2, Save } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  
  const [apiConfig, setApiConfig] = useState({
    N8N_WEBHOOK_URL: "",
    LINE_OA_TOKEN: "",
    SMTP_HOST: "",
    LINE_APPROVAL_TEMPLATE: "Congratulations! Your registration for {{EVENT_NAME}} has been approved. Your QR code token is: {{QR_TOKEN}}",
    AUTO_APPROVE: "false",
    ORGANIZATION_NAME: "Event Registration Platform",
    MIN_BOOTH_VISITS_FOR_REWARD: "3",
    ID_PREFIX_USER: "USR-",
    ID_PREFIX_CUSTOMER: "CUS-",
    ID_PREFIX_EVENT: "EVT-",
    ID_PREFIX_BOOTH: "BTH-",
    ID_PREFIX_REGISTRATION: "REG-",
    ID_PREFIX_QRCODE: "QR-",
    ID_PREFIX_CHECKIN: "CHK-",
    ID_PREFIX_BOOTHVISIT: "BTV-",
    ID_PREFIX_REWARD: "RWD-",
    ID_PREFIX_BLACKLIST: "BLK-",
    AZURE_AD_CLIENT_ID: "",
    AZURE_AD_CLIENT_SECRET: "",
    AZURE_AD_TENANT_ID: "",
    MAIL_SENDER_ADDRESS: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingApi, setSavingApi] = useState(false);
  const [savingAuth, setSavingAuth] = useState(false);
  const [savingPrefixes, setSavingPrefixes] = useState(false);
  const [message, setMessage] = useState({ apiType: "", apiText: "", authType: "", authText: "", prefixesType: "", prefixesText: "" });

  useEffect(() => {
    setOrigin(window.location.origin);
    
    // Fetch settings
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setApiConfig({
            N8N_WEBHOOK_URL: data.N8N_WEBHOOK_URL || "",
            LINE_OA_TOKEN: data.LINE_OA_TOKEN || "",
            SMTP_HOST: data.SMTP_HOST || "",
            LINE_APPROVAL_TEMPLATE: data.LINE_APPROVAL_TEMPLATE || "Congratulations! Your registration for {{EVENT_NAME}} has been approved. Your QR code token is: {{QR_TOKEN}}",
            AUTO_APPROVE: data.AUTO_APPROVE || "false",
            ORGANIZATION_NAME: data.ORGANIZATION_NAME || "Event Registration Platform",
            MIN_BOOTH_VISITS_FOR_REWARD: data.MIN_BOOTH_VISITS_FOR_REWARD || "3",
            ID_PREFIX_USER: data.ID_PREFIX_USER || "USR-",
            ID_PREFIX_CUSTOMER: data.ID_PREFIX_CUSTOMER || "CUS-",
            ID_PREFIX_EVENT: data.ID_PREFIX_EVENT || "EVT-",
            ID_PREFIX_BOOTH: data.ID_PREFIX_BOOTH || "BTH-",
            ID_PREFIX_REGISTRATION: data.ID_PREFIX_REGISTRATION || "REG-",
            ID_PREFIX_QRCODE: data.ID_PREFIX_QRCODE || "QR-",
            ID_PREFIX_CHECKIN: data.ID_PREFIX_CHECKIN || "CHK-",
            ID_PREFIX_BOOTHVISIT: data.ID_PREFIX_BOOTHVISIT || "BTV-",
            ID_PREFIX_REWARD: data.ID_PREFIX_REWARD || "RWD-",
            ID_PREFIX_BLACKLIST: data.ID_PREFIX_BLACKLIST || "BLK-",
            AZURE_AD_CLIENT_ID: data.AZURE_AD_CLIENT_ID || "",
            AZURE_AD_CLIENT_SECRET: data.AZURE_AD_CLIENT_SECRET || "",
            AZURE_AD_TENANT_ID: data.AZURE_AD_TENANT_ID || "",
            MAIL_SENDER_ADDRESS: data.MAIL_SENDER_ADDRESS || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = () => {
    const registerUrl = `${origin || window.location.origin}/register`;
    navigator.clipboard.writeText(registerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent, section: 'api' | 'prefixes' | 'auth' = 'api') => {
    e.preventDefault();
    if (section === 'api') {
      setSavingApi(true);
      setMessage(prev => ({ ...prev, apiType: "", apiText: "" }));
    } else if (section === 'auth') {
      setSavingAuth(true);
      setMessage(prev => ({ ...prev, authType: "", authText: "" }));
    } else {
      setSavingPrefixes(true);
      setMessage(prev => ({ ...prev, prefixesType: "", prefixesText: "" }));
    }
    
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiConfig),
      });
      
      if (!res.ok) throw new Error("Failed to save settings");
      
      if (section === 'api') {
        setMessage(prev => ({ ...prev, apiType: "success", apiText: "API settings saved successfully!" }));
        setTimeout(() => setMessage(prev => ({ ...prev, apiType: "", apiText: "" })), 3000);
      } else if (section === 'auth') {
        setMessage(prev => ({ ...prev, authType: "success", authText: "Auth settings saved successfully!" }));
        setTimeout(() => setMessage(prev => ({ ...prev, authType: "", authText: "" })), 3000);
      } else {
        setMessage(prev => ({ ...prev, prefixesType: "success", prefixesText: "ID prefixes saved successfully!" }));
        setTimeout(() => setMessage(prev => ({ ...prev, prefixesType: "", prefixesText: "" })), 3000);
      }
    } catch (err) {
      if (section === 'api') {
        setMessage(prev => ({ ...prev, apiType: "error", apiText: "Failed to save API settings." }));
      } else if (section === 'auth') {
        setMessage(prev => ({ ...prev, authType: "error", authText: "Failed to save Auth settings." }));
      } else {
        setMessage(prev => ({ ...prev, prefixesType: "error", prefixesText: "Failed to save ID prefixes." }));
      }
    } finally {
      if (section === 'api') setSavingApi(false);
      else if (section === 'auth') setSavingAuth(false);
      else setSavingPrefixes(false);
    }
  };

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[17px] sm:text-xl font-bold tracking-tight text-foreground leading-tight">
              Platform Settings
            </h2>
            <p className="text-[13px] sm:text-sm text-muted-foreground mt-0.5">
              Manage registration links and third-party API integrations.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Share Link Card */}
          <div className="apple-card p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10">
              <Copy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h3 className="text-[16px] sm:text-lg font-semibold tracking-tight text-foreground">
              Share Registration Form
            </h3>
            <p className="mb-4 sm:mb-6 mt-1 sm:mt-2 text-[13px] sm:text-[15px] text-muted-foreground leading-tight">
              Send this secure link to your customers so they can register for your events. They will not be able to access the admin dashboard.
            </p>
            
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border/50 bg-muted/20 p-2">
              <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-sm text-muted-foreground">
                {origin ? `${origin}/register` : '.../register'}
              </code>
              <button
                onClick={handleCopyLink}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-border/50 bg-muted/5 p-4 overflow-hidden">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interactive Form Preview</div>
                <a href={`${origin}/register`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium">Open in new tab ↗</a>
              </div>
              <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm dark:bg-zinc-950">
                {origin ? (
                  <iframe 
                    src={`${origin}/register`} 
                    className="absolute left-0 top-0 h-[166.67%] w-[166.67%] origin-top-left scale-[0.6] border-0"
                    title="Registration Form Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Integrations Card */}
          <div className="apple-card p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Webhook className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
            <h3 className="text-[16px] sm:text-lg font-semibold tracking-tight text-foreground">
              Platform Configuration
            </h3>
            <p className="mb-4 sm:mb-6 mt-1 sm:mt-2 text-[13px] sm:text-[15px] text-muted-foreground leading-tight">
              Configure endpoints, rules, and messaging templates.
            </p>
            
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="auto-approve" className="mb-1.5 block text-sm font-medium">Auto-Approve Registrations</label>
                    <Select
                      value={apiConfig.AUTO_APPROVE}
                      onValueChange={(val: string | null) => setApiConfig({ ...apiConfig, AUTO_APPROVE: val as string })}
                      items={[
                        { value: "true", label: "Yes, automatically approve" },
                        { value: "false", label: "No, manual approval required" }
                      ]}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select approval mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes, automatically approve</SelectItem>
                        <SelectItem value="false">No, manual approval required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label htmlFor="organization-name" className="mb-1.5 block text-sm font-medium">Organization Name</label>
                  <input
                    id="organization-name"
                    type="text"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="E.g., Tech Corp"
                    value={apiConfig.ORGANIZATION_NAME}
                    onChange={(e) => setApiConfig({ ...apiConfig, ORGANIZATION_NAME: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="n8n-webhook-url" className="mb-1.5 block text-sm font-medium">n8n Webhook URL (For Line Messages)</label>
                  <input
                    id="n8n-webhook-url"
                    type="url"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="https://n8n.yourdomain.com/webhook/..."
                    value={apiConfig.N8N_WEBHOOK_URL}
                    onChange={(e) => setApiConfig({ ...apiConfig, N8N_WEBHOOK_URL: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="line-oa-token" className="mb-1.5 block text-sm font-medium">LINE OA Channel Access Token</label>
                  <input
                    id="line-oa-token"
                    type="text"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="eyJhbGciOiJIUzI1..."
                    value={apiConfig.LINE_OA_TOKEN}
                    onChange={(e) => setApiConfig({ ...apiConfig, LINE_OA_TOKEN: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="approval-message-template" className="mb-1.5 block text-sm font-medium">Approval Message Template</label>
                  <p className="mb-2 text-xs text-muted-foreground">Available variables: {'{{EVENT_NAME}}'}, {'{{QR_TOKEN}}'}</p>
                  <textarea
                    id="approval-message-template"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    value={apiConfig.LINE_APPROVAL_TEMPLATE}
                    onChange={(e) => setApiConfig({ ...apiConfig, LINE_APPROVAL_TEMPLATE: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border mt-4">
                  {message.apiText && (
                    <p className={`text-sm font-medium ${message.apiType === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {message.apiText}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={savingApi}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {savingApi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save API Settings
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Form 3: Authentication (Azure AD) */}
          <div className="apple-card p-4 shadow-sm border border-border/50 sm:p-6 md:col-span-2">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Authentication Settings
            </h3>
            <p className="mb-6 mt-2 text-[15px] text-muted-foreground">
              Configure Microsoft Azure AD credentials for Admin & Staff login. Note: Changes take effect on the next login attempt.
            </p>
            
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={(e) => handleSaveConfig(e, 'auth')} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="azure-ad-tenant-id" className="mb-1 block text-sm font-medium text-foreground">Azure AD Tenant ID</label>
                    <input
                      id="azure-ad-tenant-id"
                      type="text"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                      value={apiConfig.AZURE_AD_TENANT_ID}
                      onChange={(e) => setApiConfig({ ...apiConfig, AZURE_AD_TENANT_ID: e.target.value })}
                      placeholder="e.g. 8eaef023-..."
                    />
                  </div>
                  <div>
                    <label htmlFor="azure-ad-client-id" className="mb-1 block text-sm font-medium text-foreground">Azure AD Client ID</label>
                    <input
                      id="azure-ad-client-id"
                      type="text"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                      value={apiConfig.AZURE_AD_CLIENT_ID}
                      onChange={(e) => setApiConfig({ ...apiConfig, AZURE_AD_CLIENT_ID: e.target.value })}
                      placeholder="e.g. 1a2b3c4d-..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="azure-ad-client-secret" className="mb-1 block text-sm font-medium text-foreground">Azure AD Client Secret</label>
                    <input
                      id="azure-ad-client-secret"
                      type="password"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                      value={apiConfig.AZURE_AD_CLIENT_SECRET}
                      onChange={(e) => setApiConfig({ ...apiConfig, AZURE_AD_CLIENT_SECRET: e.target.value })}
                      placeholder="Leave blank to use environment variable fallback"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="mail-sender-address" className="mb-1 block text-sm font-medium text-foreground">Microsoft 365 Sender Email Address (For Email via Graph API)</label>
                    <input
                      id="mail-sender-address"
                      type="email"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                      value={apiConfig.MAIL_SENDER_ADDRESS}
                      onChange={(e) => setApiConfig({ ...apiConfig, MAIL_SENDER_ADDRESS: e.target.value })}
                      placeholder="e.g. no-reply@yourdomain.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border mt-4">
                  {message.authType === 'success' && (
                    <p className="text-sm font-medium text-emerald-600">{message.authText}</p>
                  )}
                  {message.authType === 'error' && (
                    <p className="text-sm font-medium text-red-600">{message.authText}</p>
                  )}
                  <button
                    type="submit"
                    disabled={savingAuth}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors sm:w-auto sm:self-end"
                  >
                    {savingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Auth Settings
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* ID Prefixes Card */}
        <div className="apple-card animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            <Copy className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            ID Generation Prefixes
          </h3>
          <p className="mb-6 mt-2 text-[15px] text-muted-foreground">
            Configure prefixes for automatically generated IDs across the system.
          </p>
          
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={(e) => handleSaveConfig(e, 'prefixes')} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { key: "ID_PREFIX_USER", label: "User" },
                  { key: "ID_PREFIX_CUSTOMER", label: "Customer" },
                  { key: "ID_PREFIX_EVENT", label: "Event" },
                  { key: "ID_PREFIX_BOOTH", label: "Booth" },
                  { key: "ID_PREFIX_REGISTRATION", label: "Registration" },
                  { key: "ID_PREFIX_QRCODE", label: "QR Code" },
                  { key: "ID_PREFIX_CHECKIN", label: "Check-In" },
                  { key: "ID_PREFIX_BOOTHVISIT", label: "Booth Visit" },
                  { key: "ID_PREFIX_REWARD", label: "Reward" },
                  { key: "ID_PREFIX_BLACKLIST", label: "Blacklist" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label htmlFor={key} className="mb-1 block text-xs text-muted-foreground">{label}</label>
                    <input
                      id={key}
                      type="text"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                      value={apiConfig[key as keyof typeof apiConfig] || ""}
                      onChange={(e) => setApiConfig({ ...apiConfig, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-border mt-4">
                {message.prefixesText && (
                  <p className={`text-sm font-medium ${message.prefixesType === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {message.prefixesText}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingPrefixes}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors sm:w-auto sm:self-end"
                >
                  {savingPrefixes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save ID Prefixes
                </button>
              </div>
            </form>
          )}
        </div>
        
      </div>
    </AppShell>
  );
}
