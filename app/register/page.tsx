import type { Metadata } from "next";
import Link from "next/link";
import RegistrationForm from "../../components/RegistrationForm";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Register — EventReg",
  description:
    "Register for an upcoming event. Fill in your details to secure your spot and receive a QR check-in code.",
};

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-8 lg:px-6 linear-grid">
      {/* Background gradient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-40 -right-40 h-96 w-96 rounded-full bg-[#EA580C]/15 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">

        {/* Card */}
        <div className="apple-card">
          <div className="mb-6 text-center">
            {/* Brand mark */}
            <div className="mb-4 flex justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-[0.6rem] bg-foreground text-sm font-bold text-background tracking-wider shadow-sm glow-border">
                NC
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Register for an Event
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Complete the form below to secure your spot.
            </p>
          </div>

          <RegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;