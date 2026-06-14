// Preset example briefs to load with one click (speeds up testing/demos).

import type { BusinessTypeId, DataPackId, QuantityId, ToneId } from "./types";

export interface ExampleBrief {
  id: string;
  label: string;
  brief: string;
  businessType: BusinessTypeId;
  packs: DataPackId[];
  quantity: QuantityId;
  tone: ToneId;
}

export const EXAMPLES: ExampleBrief[] = [
  {
    id: "leaking-shower",
    label: "Leaking shower trade business",
    brief:
      "Small plumbing business that fixes leaking showers, hot water systems and blocked drains. Needs sample jobs, customers and a few overdue/urgent examples for a job-tracker prototype.",
    businessType: "trade",
    packs: ["customers", "jobs", "quotes", "tasks"],
    quantity: "medium",
    tone: "friendly",
  },
  {
    id: "dog-walking",
    label: "Dog walking business",
    brief:
      "Dog walking and pet grooming service taking regular bookings. Needs sample customers, bookings and reviews for a booking-app demo.",
    businessType: "booking",
    packs: ["customers", "jobs", "reviews", "messages"],
    quantity: "medium",
    tone: "casual",
  },
  {
    id: "booking-request-site",
    label: "Booking request website",
    brief:
      "A website where visitors submit booking/enquiry requests. Needs realistic incoming leads with sources, urgency and a duplicate enquiry edge case.",
    businessType: "crm",
    packs: ["leads", "messages", "tasks"],
    quantity: "medium",
    tone: "professional",
  },
  {
    id: "quote-follow-up",
    label: "Quote follow-up tracker",
    brief:
      "Tool to track quotes that have been sent and need following up. Needs sample quotes/invoices, follow-up tasks and customer contacts, including an overdue invoice.",
    businessType: "professional",
    packs: ["customers", "quotes", "tasks"],
    quantity: "small",
    tone: "professional",
  },
  {
    id: "internal-task-tracker",
    label: "Internal task tracker",
    brief:
      "Internal operations task board for a small team. Needs sample staff, tasks and follow-ups including overdue items.",
    businessType: "internal",
    packs: ["staff", "tasks", "messages"],
    quantity: "medium",
    tone: "professional",
  },
];
