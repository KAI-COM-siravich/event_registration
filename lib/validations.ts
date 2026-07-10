import { z } from "zod";

export const RegistrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters").optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  jobPosition: z.string().optional().or(z.literal("")),
  travelMethod: z.string().optional().nullable().or(z.literal("")),
  needHotel: z.string().optional().nullable().or(z.literal("")),
  salesRep: z.string().optional().nullable().or(z.literal("")),
  plannedUpgrade: z.string().optional().nullable().or(z.literal("")),
  projectByYear: z.string().optional().nullable().or(z.literal("")),
  consent: z.boolean().default(false),
});

export const BlacklistSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  reason: z.string().min(1, "Reason is required"),
}).refine(data => data.email || data.phone || data.company, {
  message: "At least one of email, phone, or company must be provided",
  path: ["email"], // attach error to email field generally
});

export const EventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional().or(z.literal("")),
  date: z.string().datetime({ message: "Invalid date format (must be ISO 8601)" }),
  location: z.string().min(1, "Location is required"),
});

export const BoothSchema = z.object({
  name: z.string().min(1, "Booth name is required"),
  eventId: z.string().min(1, "Event ID is required"),
});
