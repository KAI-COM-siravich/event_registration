"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, Loader2 } from "lucide-react";

type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  eventId: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const STEPS = ["Personal Info", "Select Event", "Confirm"] as const;

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  eventId: "",
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6 flex items-center justify-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                  done
                    ? "bg-foreground text-background"
                    : active
                    ? "bg-foreground text-background ring-2 ring-foreground/20"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {done ? <Check className="h-3 w-3" aria-hidden="true" /> : i + 1}
              </div>
              <span
                className={[
                  "mt-1.5 hidden text-[11px] font-medium uppercase tracking-wider sm:block transition-colors",
                  active ? "text-foreground" : "text-muted-foreground/50",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "mx-2 mb-4 h-[1px] w-8 transition-colors duration-300 sm:w-16",
                  i < current ? "bg-foreground" : "bg-border",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const inputClass =
  "w-full rounded-[0.8rem] border-[0.5px] border-border/50 bg-background/50 backdrop-blur-md px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/50 shadow-sm focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background transition-all disabled:opacity-50";
const labelClass = "mb-1.5 block text-[13px] font-medium text-foreground";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-red-500">
      {msg}
    </p>
  );
}

const RegistrationForm = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setEventsLoading(true);
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: unknown) => {
        setEvents(Array.isArray(data) ? (data as Event[]) : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (!form.eventId) {
      setErrors({ eventId: "Please select an event" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Registration failed");
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === form.eventId);

  // Success screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center animate-in fade-in duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#34C759]/10">
          <Check className="h-10 w-10 text-[#34C759]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Registration Complete</h2>
        <p className="max-w-sm text-[17px] text-muted-foreground leading-relaxed">
          Your registration is <strong>pending approval</strong>. You will receive a QR
          code once approved. Check your email for updates.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(INITIAL);
            setStep(0);
            setSubmitted(false);
          }}
          className="mt-6 text-[15px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Register another person
        </button>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={step} />

      <div className="min-h-[250px]">
        {/* Step 1 — Personal Info */}
        {step === 0 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-firstName" className={labelClass}>
                  First Name <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="reg-firstName"
                  type="text"
                  className={inputClass}
                  placeholder="John"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
                <FieldError msg={errors.firstName} />
              </div>
              <div>
                <label htmlFor="reg-lastName" className={labelClass}>
                  Last Name <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="reg-lastName"
                  type="text"
                  className={inputClass}
                  placeholder="Appleseed"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
                <FieldError msg={errors.lastName} />
              </div>
            </div>
            <div>
              <label htmlFor="reg-email" className={labelClass}>
                Email Address <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                className={inputClass}
                placeholder="john@apple.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <FieldError msg={errors.email} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-phone" className={labelClass}>
                  Phone
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  className={inputClass}
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reg-company" className={labelClass}>
                  Company
                </label>
                <input
                  id="reg-company"
                  type="text"
                  className={inputClass}
                  placeholder="Apple Inc."
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Select Event */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
            <p className="text-[17px] font-semibold tracking-tight text-foreground">
              Select Event <span className="text-red-500" aria-hidden="true">*</span>
            </p>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" aria-hidden="true" />
              </div>
            ) : events.length === 0 ? (
              <p className="rounded-2xl border border-border bg-muted/30 px-6 py-8 text-center text-[15px] text-muted-foreground">
                No events available at this time.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => {
                  const selected = form.eventId === event.id;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => set("eventId", event.id)}
                      className={[
                        "w-full rounded-2xl border p-5 text-left transition-all duration-200",
                        selected
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p
                            className={`text-[15px] font-semibold tracking-tight ${selected ? "text-primary" : "text-foreground"}`}
                          >
                            {event.name}
                          </p>
                          <p className="mt-1 text-[15px] text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            · {event.location}
                          </p>
                        </div>
                        {selected && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <FieldError msg={errors.eventId} />
          </div>
        )}

        {/* Step 3 — Confirm */}
        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 sm:p-8">
              <h3 className="mb-6 text-[17px] font-semibold tracking-tight text-foreground">Review your details</h3>
              <dl className="space-y-4">
                {[
                  { label: "Name", value: `${form.firstName} ${form.lastName}` },
                  { label: "Email", value: form.email },
                  { label: "Phone", value: form.phone || "—" },
                  { label: "Company", value: form.company || "—" },
                  { label: "Event", value: selectedEvent?.name ?? form.eventId },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <dt className="w-32 shrink-0 text-[15px] font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 sm:mt-0 text-[17px] font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {submitError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
              >
                {submitError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div
        className={`mt-10 flex ${step === 0 ? "justify-end" : "justify-between"}`}
      >
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-secondary px-6 text-[17px] font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
          >
            Back
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            className="glow-border inline-flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-transform hover:scale-105"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="glow-border inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting && (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            )}
            {submitting ? "Submitting…" : "Confirm & Register"}
          </button>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;