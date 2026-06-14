// Safe, obviously-fictional data pools.
//
// Safety conventions used throughout:
//  - Emails use @example.com (reserved by RFC 2606 for documentation/testing).
//  - AU phone numbers use ACMA's ranges reserved for fictional use only:
//      mobiles  0491 570 000 – 0491 579 999
//      landline (0x) 5550 0000 – 5550 9999
//  - Suburbs are invented sample names so no real address is implied.
// None of this data refers to real people, places, or accounts.

import type { BusinessTypeId } from "./types";

export const FIRST_NAMES = [
  "Jordan", "Avery", "Riley", "Casey", "Morgan", "Quinn", "Harper", "Reese",
  "Sage", "Rowan", "Devon", "Marlow", "Indie", "Blair", "Frankie", "Lennox",
  "Aria", "Milo", "Nova", "Theo", "Priya", "Tariq", "Mei", "Diego",
];

export const LAST_NAMES = [
  "Sample", "Mockton", "Testerly", "Placeholder", "Demoson", "Fauxley",
  "Exampleton", "Dummett", "Stubbsworth", "Proxyman", "Fixtura", "Seedwell",
  "Nullsby", "Lipsumire", "Sandbox", "Prototype",
];

export const BUSINESS_SUFFIXES = [
  "& Co (sample)", "Group (demo)", "Services (sample)", "Studio (demo)",
  "Solutions (sample)", "Collective (demo)",
];

// Invented suburbs — not real places.
export const SAMPLE_SUBURBS = [
  "Sampleford", "Mockville", "Testbury", "Demohaven", "Fauxfield",
  "Placeholder Park", "Seedton", "Sandbox Heights", "Prototype Bay",
];

export const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export const STREET_NAMES = [
  "Example", "Sample", "Mockingbird", "Placeholder", "Demonstration",
  "Fixture", "Sandbox", "Prototype", "Lorem", "Ipsum",
];

export const STREET_TYPES = ["St", "Rd", "Ave", "Way", "Cl", "Pde"];

export const LEAD_SOURCES = [
  "Website form", "Google search", "Facebook ad", "Word of mouth",
  "Repeat customer", "Instagram", "Local directory", "Referral",
];

export const REVIEW_SOURCES = ["Google", "Facebook", "Website", "Word of mouth"];

export const REVIEW_SNIPPETS_POSITIVE = [
  "Turned up on time and did exactly what was promised.",
  "Really easy to deal with from the first call to the finish.",
  "Clear pricing, no surprises, would book again.",
  "Friendly team and tidy work. Highly recommend.",
  "Sorted everything quickly and explained the options well.",
];

export const REVIEW_SNIPPETS_MIXED = [
  "Good work overall, though running a little behind on the day.",
  "Happy with the result. Communication could have been a touch quicker.",
  "Solid job. Quote took a couple of days to come through.",
];

// Per-business-type vocabulary so generated services/jobs feel relevant.
interface Vocab {
  // What the business sells / offers.
  services: { name: string; min: number; max: number; unit: string }[];
  // Noun used for a unit of work.
  jobNoun: string;
  // Staff role pool.
  roles: string[];
  // Short enquiry message fragments.
  enquiryNeeds: string[];
}

export const VOCAB: Record<BusinessTypeId, Vocab> = {
  trade: {
    jobNoun: "job",
    services: [
      { name: "Leaking shower repair", min: 280, max: 650, unit: "job" },
      { name: "Hot water system replacement", min: 900, max: 2200, unit: "job" },
      { name: "Blocked drain clear", min: 180, max: 420, unit: "job" },
      { name: "Switchboard upgrade", min: 750, max: 1800, unit: "job" },
      { name: "General maintenance", min: 120, max: 480, unit: "hour" },
    ],
    roles: ["Plumber", "Electrician", "Apprentice", "Office admin", "Scheduler"],
    enquiryNeeds: [
      "leaking shower in the main bathroom",
      "no hot water since this morning",
      "a blocked kitchen drain",
      "a quote to upgrade the switchboard",
      "a dripping outdoor tap",
    ],
  },
  booking: {
    jobNoun: "booking",
    services: [
      { name: "Standard clean", min: 90, max: 180, unit: "booking" },
      { name: "Deep clean", min: 220, max: 420, unit: "booking" },
      { name: "Dog walk (1 hr)", min: 30, max: 55, unit: "walk" },
      { name: "Wash & groom", min: 65, max: 140, unit: "booking" },
      { name: "End of lease clean", min: 320, max: 600, unit: "booking" },
    ],
    roles: ["Groomer", "Cleaner", "Walker", "Coordinator", "Front desk"],
    enquiryNeeds: [
      "a fortnightly house clean",
      "a dog walk while we're at work",
      "an end of lease clean next week",
      "a regular grooming slot",
      "a one-off deep clean",
    ],
  },
  crm: {
    jobNoun: "deal",
    services: [
      { name: "Starter package", min: 500, max: 1500, unit: "package" },
      { name: "Growth package", min: 1500, max: 4500, unit: "package" },
      { name: "Consultation", min: 0, max: 250, unit: "session" },
      { name: "Monthly retainer", min: 800, max: 2500, unit: "month" },
    ],
    roles: ["Sales rep", "Account manager", "Coordinator", "Owner"],
    enquiryNeeds: [
      "more information on your packages",
      "a callback about pricing",
      "help deciding which option suits us",
      "a proposal for our team",
      "a quick chat this week",
    ],
  },
  health: {
    jobNoun: "appointment",
    services: [
      { name: "Initial consult", min: 90, max: 160, unit: "appointment" },
      { name: "Follow-up session", min: 70, max: 120, unit: "appointment" },
      { name: "Group class", min: 18, max: 35, unit: "class" },
      { name: "Wellness program (6 wks)", min: 290, max: 540, unit: "program" },
    ],
    roles: ["Practitioner", "Therapist", "Receptionist", "Coach"],
    enquiryNeeds: [
      "a first appointment",
      "to rebook a follow-up",
      "info about your weekly classes",
      "whether you have evening sessions",
      "a program suited to beginners",
    ],
  },
  professional: {
    jobNoun: "engagement",
    services: [
      { name: "Tax return", min: 180, max: 450, unit: "return" },
      { name: "Bookkeeping (monthly)", min: 250, max: 700, unit: "month" },
      { name: "Brand & website project", min: 2500, max: 9000, unit: "project" },
      { name: "Strategy session", min: 200, max: 600, unit: "session" },
    ],
    roles: ["Accountant", "Consultant", "Designer", "Account manager"],
    enquiryNeeds: [
      "help with this year's tax return",
      "ongoing bookkeeping",
      "a quote for a new website",
      "a strategy session for the quarter",
      "advice on our setup",
    ],
  },
  retail: {
    jobNoun: "order",
    services: [
      { name: "Sample Tee", min: 28, max: 45, unit: "item" },
      { name: "Demo Mug", min: 16, max: 24, unit: "item" },
      { name: "Placeholder Tote", min: 22, max: 38, unit: "item" },
      { name: "Mock Candle", min: 20, max: 34, unit: "item" },
      { name: "Test Notebook", min: 12, max: 19, unit: "item" },
    ],
    roles: ["Store manager", "Sales assistant", "Packer", "Buyer"],
    enquiryNeeds: [
      "stock availability",
      "shipping times to my area",
      "a return on a recent order",
      "whether you do wholesale",
      "a discount on a bulk order",
    ],
  },
  internal: {
    jobNoun: "ticket",
    services: [
      { name: "Onboarding setup", min: 0, max: 0, unit: "task" },
      { name: "Equipment request", min: 0, max: 0, unit: "task" },
      { name: "Process review", min: 0, max: 0, unit: "task" },
      { name: "Monthly report", min: 0, max: 0, unit: "task" },
    ],
    roles: ["Operations", "Team lead", "Admin", "Manager"],
    enquiryNeeds: [
      "access to the shared drive",
      "a new laptop set up",
      "the onboarding checklist",
      "an update on last month's report",
      "approval for a purchase",
    ],
  },
  custom: {
    jobNoun: "item",
    services: [
      { name: "Service A", min: 50, max: 300, unit: "item" },
      { name: "Service B", min: 100, max: 600, unit: "item" },
      { name: "Service C", min: 200, max: 900, unit: "item" },
    ],
    roles: ["Operator", "Manager", "Assistant", "Coordinator"],
    enquiryNeeds: [
      "more information",
      "a quote",
      "a callback",
      "to book something in",
      "help getting started",
    ],
  },
};
