"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    // Call the next-auth signIn function for azure-ad
    // This will redirect to Microsoft's login page
    await signIn("azure-ad", { callbackUrl: "/admin" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background linear-grid px-4">
      <div className="w-full max-w-md apple-card p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[0.8rem] bg-foreground text-lg font-bold text-background tracking-wider shadow-sm glow-border">
              NC
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Staff & Admin Login
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access the event management dashboard.
          </p>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50 mt-6">
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="glow-border inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-foreground px-6 text-[15px] font-semibold text-background transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 21 21"
                >
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Sign In with Microsoft
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
