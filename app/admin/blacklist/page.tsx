import { Metadata } from "next";
import { AppShell } from "../../../components/layout/AppShell";
import BlacklistManager from "../../../components/admin/BlacklistManager";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Blacklist Management — Admin",
};

export default function BlacklistPage() {
  return (
    <AppShell title="Blacklist Management">
      <div className="mx-auto max-w-5xl relative z-10 space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-8 flex flex-col gap-1 sm:block">
          <div className="mb-1 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-[0.8rem] bg-red-500/10 glow-border">
            <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
            Blacklist Rules
          </h1>
          <p className="mt-1 sm:mt-2 text-[13px] sm:text-[15px] text-muted-foreground leading-tight">
            Manage blocked emails, phone numbers, and companies. Registrations matching these rules will be flagged for review.
          </p>
        </div>

        <BlacklistManager />
      </div>
    </AppShell>
  );
}
