"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    await signIn("azure-ad", { callbackUrl: "/admin" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background linear-grid px-4">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#EA580C]/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-foreground text-xl font-bold text-background tracking-wider shadow-2xl glow-border">
              NC
            </span>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            Staff & Admin Login
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Sign in to access the event management platform.
          </p>
        </div>

        {/* Login card */}
        <div className="apple-card-hero p-6 space-y-4">
          <button
            type="button"
            id="microsoft-login-btn"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="glow-border inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-foreground px-6 text-[16px] font-semibold text-background transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Sign In with Microsoft
              </>
            )}
          </button>
          <p className="text-center text-[12px] text-muted-foreground">
            Only authorized staff and administrators may log in.
          </p>
        </div>
      </div>
    </div>
  );
}
