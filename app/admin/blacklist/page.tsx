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
      <div className="mx-auto max-w-5xl relative z-10 space-y-6">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[0.8rem] bg-red-500/10 glow-border">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Blacklist Rules
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Manage blocked emails, phone numbers, and companies. Registrations matching these rules will be flagged for review.
          </p>
        </div>

        <BlacklistManager />
      </div>
    </AppShell>
  );
}
