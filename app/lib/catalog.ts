// Static option catalogs for the generator UI and engine.

import type {
  BusinessTypeId,
  DataPackId,
  QuantityId,
  RegionId,
  ToneId,
} from "./types";

export const BUSINESS_TYPES: { id: BusinessTypeId; label: string; hint: string }[] = [
  { id: "trade", label: "Trade services", hint: "Plumbing, electrical, building" },
  { id: "booking", label: "Booking / service business", hint: "Salons, cleaners, dog walking" },
  { id: "crm", label: "Lead tracker / CRM", hint: "Enquiries and follow-ups" },
  { id: "health", label: "Health / wellness", hint: "Clinics, therapy, fitness" },
  { id: "professional", label: "Professional services", hint: "Accountants, agencies, legal" },
  { id: "retail", label: "Retail / products", hint: "Online or in-store products" },
  { id: "internal", label: "Internal operations", hint: "Team tasks and ops tools" },
  { id: "custom", label: "Custom", hint: "Generic mixed sample data" },
];

export const DATA_PACKS: { id: DataPackId; label: string; hint: string }[] = [
  { id: "customers", label: "Customers / contacts", hint: "People and businesses" },
  { id: "leads", label: "Leads / enquiries", hint: "New enquiries and their status" },
  { id: "jobs", label: "Jobs / bookings", hint: "Scheduled and completed work" },
  { id: "quotes", label: "Quotes / invoices", hint: "Pricing, totals, payment status" },
  { id: "messages", label: "Messages / notes", hint: "SMS, email and internal notes" },
  { id: "tasks", label: "Tasks / follow-ups", hint: "To-dos and reminders" },
  { id: "staff", label: "Staff / operators", hint: "Team members and roles" },
  { id: "products", label: "Products / services", hint: "What is sold or offered" },
  { id: "reviews", label: "Reviews / testimonials", hint: "Ratings and feedback" },
];

export const QUANTITIES: { id: QuantityId; label: string; count: number }[] = [
  { id: "small", label: "Small (3 each)", count: 3 },
  { id: "medium", label: "Medium (6 each)", count: 6 },
  { id: "large", label: "Large (12 each)", count: 12 },
];

export const REGIONS: { id: RegionId; label: string }[] = [
  { id: "au", label: "Australia (fictional ranges)" },
  { id: "generic", label: "Generic" },
];

export const TONES: { id: ToneId; label: string }[] = [
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
];

export const QUANTITY_COUNT: Record<QuantityId, number> = {
  small: 3,
  medium: 6,
  large: 12,
};

export const DATA_PACK_LABEL: Record<DataPackId, string> = Object.fromEntries(
  DATA_PACKS.map((p) => [p.id, p.label]),
) as Record<DataPackId, string>;

export const BUSINESS_TYPE_LABEL: Record<BusinessTypeId, string> = Object.fromEntries(
  BUSINESS_TYPES.map((b) => [b.id, b.label]),
) as Record<BusinessTypeId, string>;
