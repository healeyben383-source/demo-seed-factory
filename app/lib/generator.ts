// Deterministic, local-only sample-data generator.
//
// Same SeedBrief in -> same output out. No randomness from the clock or network:
// a fixed BASE_DATE anchors all relative dates so results are reproducible.

import { QUANTITY_COUNT, DATA_PACK_LABEL } from "./catalog";
import {
  AU_STATES,
  BUSINESS_SUFFIXES,
  FIRST_NAMES,
  LAST_NAMES,
  LEAD_SOURCES,
  REVIEW_SNIPPETS_MIXED,
  REVIEW_SNIPPETS_POSITIVE,
  REVIEW_SOURCES,
  SAMPLE_SUBURBS,
  STREET_NAMES,
  STREET_TYPES,
  VOCAB,
} from "./pools";
import type {
  DataPackId,
  GeneratedPack,
  RegionId,
  SampleRecord,
  SeedBrief,
  ToneId,
} from "./types";

// Fixed anchor for all generated dates (keeps output deterministic over time).
const BASE_DATE = Date.parse("2026-06-14T09:00:00");
const DAY = 86_400_000;

// --- seeded PRNG -----------------------------------------------------------

function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- helpers ---------------------------------------------------------------

class Rng {
  private next: () => number;
  constructor(seed: string) {
    this.next = mulberry32(hashSeed(seed));
  }
  float() {
    return this.next();
  }
  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  chance(p: number) {
    return this.next() < p;
  }
}

const pad = (n: number, len: number) => String(n).padStart(len, "0");

function isoDate(dayOffset: number): string {
  return new Date(BASE_DATE + dayOffset * DAY).toISOString().slice(0, 10);
}

function makePhone(rng: Rng, region: RegionId): string {
  if (region === "generic") {
    // 555-0100..555-0199 is the reserved fictional US range.
    return `+1 555-01${pad(rng.int(0, 99), 2)}`;
  }
  if (rng.chance(0.7)) {
    // ACMA fictional mobile range: 0491 570 000 – 0491 579 999.
    return `0491 57${rng.int(0, 9)} ${pad(rng.int(0, 999), 3)}`;
  }
  // ACMA fictional landline range: (0x) 5550 0000 – 5550 9999.
  const area = rng.pick(["02", "03", "07", "08"]);
  return `(${area}) 5550 ${pad(rng.int(0, 9999), 4)}`;
}

function makeEmail(rng: Rng, first: string, last: string): string {
  const tail = rng.chance(0.4) ? rng.int(2, 99) : "";
  return `${first}.${last}${tail}@example.com`.toLowerCase();
}

function makeAddress(rng: Rng, region: RegionId): string {
  const base = `${rng.int(1, 240)} ${rng.pick(STREET_NAMES)} ${rng.pick(STREET_TYPES)}, ${rng.pick(SAMPLE_SUBURBS)}`;
  if (region === "generic") return base;
  return `${base} ${rng.pick(AU_STATES)} ${rng.int(2000, 7999)}`;
}

function greeting(tone: ToneId, name: string): string {
  switch (tone) {
    case "professional":
      return `Hello ${name},`;
    case "casual":
      return `Hey ${name}!`;
    default:
      return `Hi ${name},`;
  }
}

// A shared person used across packs so names stay consistent.
interface Person {
  name: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  isBusiness: boolean;
  company?: string;
}

function buildPeople(rng: Rng, region: RegionId, n: number): Person[] {
  const people: Person[] = [];
  const usedNames = new Set<string>();
  let guard = 0;
  while (people.length < n && guard < n * 20) {
    guard++;
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    const name = `${first} ${last}`;
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    const isBusiness = rng.chance(0.3);
    people.push({
      name,
      first,
      last,
      email: makeEmail(rng, first, last),
      phone: makePhone(rng, region),
      isBusiness,
      company: isBusiness ? `${last} ${rng.pick(BUSINESS_SUFFIXES)}` : undefined,
    });
  }
  return people;
}

// --- pack generators -------------------------------------------------------

interface Ctx {
  rng: Rng;
  brief: SeedBrief;
  count: number;
  people: Person[];
}

function genCustomers(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count, people } = ctx;
  const statuses = ["active", "active", "lead", "past", "archived"];
  return people.slice(0, count).map((p, i) => {
    const missingInfo = i === count - 1 && count > 2; // edge: missing information
    return {
      id: `cust_${pad(i + 1, 3)}`,
      name: p.isBusiness ? p.company : p.name,
      contactName: p.name,
      email: missingInfo ? "" : p.email,
      phone: p.phone,
      address: missingInfo ? "" : makeAddress(rng, brief.region),
      status: rng.pick(statuses),
      tags: rng.chance(0.4) ? ["repeat", "vip"].slice(0, rng.int(1, 2)) : [],
      createdAt: isoDate(-rng.int(10, 400)),
      notes: missingInfo
        ? "Phone enquiry — email and address still to be collected."
        : "Sample customer record (fake data).",
    };
  });
}

function genLeads(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count, people } = ctx;
  const vocab = VOCAB[brief.businessType];
  const statuses = ["new", "contacted", "quoted", "won", "lost"];
  const records: SampleRecord[] = [];
  for (let i = 0; i < count; i++) {
    const urgent = i === 0; // edge: urgent lead
    const duplicate = i === 1 && count > 2; // edge: duplicate enquiry (same person as lead 0)
    const missingInfo = i === 2 && count > 3; // edge: missing information
    const src = people[duplicate ? 0 : i % people.length];
    records.push({
      id: `lead_${pad(i + 1, 3)}`,
      name: src.name,
      email: missingInfo ? "" : src.email,
      phone: src.phone,
      source: rng.pick(LEAD_SOURCES),
      interest: rng.pick(vocab.services).name,
      message: `${greeting(brief.tone, "there")} I'm after ${rng.pick(vocab.enquiryNeeds)}.`,
      status: urgent ? "new" : rng.pick(statuses),
      urgency: urgent ? "high" : rng.pick(["low", "medium", "medium"]),
      createdAt: isoDate(-rng.int(0, 30)),
      edgeCase: urgent
        ? "urgent"
        : duplicate
          ? "duplicate-enquiry"
          : missingInfo
            ? "missing-info"
            : undefined,
    });
  }
  return records;
}

function genJobs(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count, people } = ctx;
  const vocab = VOCAB[brief.businessType];
  const records: SampleRecord[] = [];
  for (let i = 0; i < count; i++) {
    const p = people[i % people.length];
    const svc = rng.pick(vocab.services);
    let status: string;
    let scheduledOffset: number;
    let edgeCase: string | undefined;
    if (i === 0) {
      status = "overdue"; // edge: overdue job
      scheduledOffset = -rng.int(2, 9);
      edgeCase = "overdue";
    } else if (i === 1 && count > 2) {
      status = "completed"; // edge: completed job
      scheduledOffset = -rng.int(3, 40);
      edgeCase = "completed";
    } else {
      status = rng.pick(["scheduled", "scheduled", "in-progress", "completed"]);
      scheduledOffset = status === "scheduled" ? rng.int(1, 21) : -rng.int(0, 20);
    }
    const price = svc.min === 0 && svc.max === 0 ? null : rng.int(svc.min, svc.max);
    records.push({
      id: `job_${pad(i + 1, 3)}`,
      [`${vocab.jobNoun}Ref`]: `J-${pad(rng.int(1000, 9999), 4)}`,
      customer: p.isBusiness ? p.company : p.name,
      service: svc.name,
      scheduledDate: isoDate(scheduledOffset),
      status,
      assignedTo: rng.pick(vocab.roles),
      address: makeAddress(rng, brief.region),
      price,
      notes: edgeCase === "overdue" ? "Past scheduled date — needs rebooking." : "Sample job (fake data).",
      edgeCase,
    });
  }
  return records;
}

function genQuotes(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count, people } = ctx;
  const vocab = VOCAB[brief.businessType];
  const records: SampleRecord[] = [];
  for (let i = 0; i < count; i++) {
    const p = people[i % people.length];
    const lineCount = rng.int(1, 3);
    const items = Array.from({ length: lineCount }, () => {
      const svc = rng.pick(vocab.services);
      const qty = rng.int(1, 3);
      const unitPrice = svc.min === 0 && svc.max === 0 ? rng.int(40, 200) : rng.int(svc.min, svc.max);
      return { description: svc.name, qty, unitPrice, lineTotal: qty * unitPrice };
    });
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
    const gst = Math.round(subtotal * 0.1 * 100) / 100;
    const isInvoice = rng.chance(0.5);
    let status: string;
    let edgeCase: string | undefined;
    if (i === 0 && isInvoice) {
      status = "overdue"; // edge: overdue invoice
      edgeCase = "overdue";
    } else {
      status = isInvoice
        ? rng.pick(["sent", "paid", "paid"])
        : rng.pick(["draft", "sent", "accepted"]);
    }
    const issuedOffset = -rng.int(1, 45);
    records.push({
      id: `${isInvoice ? "inv" : "quote"}_${pad(i + 1, 3)}`,
      number: `${isInvoice ? "INV" : "QTE"}-${pad(1000 + i, 4)}`,
      type: isInvoice ? "invoice" : "quote",
      customer: p.isBusiness ? p.company : p.name,
      items,
      subtotal,
      gst,
      total: Math.round((subtotal + gst) * 100) / 100,
      currency: brief.region === "generic" ? "USD" : "AUD",
      status,
      issuedDate: isoDate(issuedOffset),
      dueDate: isInvoice ? isoDate(issuedOffset + 14) : null,
      edgeCase,
    });
  }
  return records;
}

function genMessages(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count, people } = ctx;
  const channels = ["sms", "email", "note"];
  const records: SampleRecord[] = [];
  for (let i = 0; i < count; i++) {
    const p = people[i % people.length];
    const channel = rng.pick(channels);
    const inbound = rng.chance(0.5);
    const followUp = i === 0; // edge: follow-up reminder note
    let body: string;
    let direction: string;
    if (followUp) {
      direction = "internal";
      body = `Follow-up reminder: check in with ${p.first} about their enquiry.`;
    } else if (channel === "note") {
      direction = "internal";
      body = `Note: ${p.first} prefers ${rng.pick(["morning", "afternoon", "weekend"])} contact.`;
    } else if (inbound) {
      direction = "inbound";
      body = `${greeting(brief.tone, "team")} just checking on the status of my ${rng.pick(["booking", "quote", "job"])}.`;
    } else {
      direction = "outbound";
      body = `${greeting(brief.tone, p.first)} a quick update on your request — we'll be in touch shortly.`;
    }
    records.push({
      id: `msg_${pad(i + 1, 3)}`,
      contact: p.name,
      channel: followUp ? "note" : channel,
      direction,
      body,
      sentAt: isoDate(-rng.int(0, 20)),
      edgeCase: followUp ? "follow-up" : undefined,
    });
  }
  return records;
}

function genTasks(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count, people } = ctx;
  const vocab = VOCAB[brief.businessType];
  const titles = [
    "Call back about quote",
    "Send follow-up email",
    "Order parts",
    "Confirm booking time",
    "Chase outstanding invoice",
    "Schedule next visit",
  ];
  const records: SampleRecord[] = [];
  for (let i = 0; i < count; i++) {
    const p = people[i % people.length];
    let status: string;
    let dueOffset: number;
    let edgeCase: string | undefined;
    if (i === 0) {
      status = "overdue"; // edge: overdue task
      dueOffset = -rng.int(1, 6);
      edgeCase = "overdue";
    } else if (i === 1 && count > 2) {
      status = "todo";
      dueOffset = rng.int(1, 3);
      edgeCase = "follow-up"; // edge: follow-up reminder
    } else {
      status = rng.pick(["todo", "doing", "done"]);
      dueOffset = status === "done" ? -rng.int(1, 10) : rng.int(0, 14);
    }
    records.push({
      id: `task_${pad(i + 1, 3)}`,
      title: edgeCase === "follow-up" ? `Follow up with ${p.first}` : rng.pick(titles),
      relatedTo: p.name,
      assignedTo: rng.pick(vocab.roles),
      priority: edgeCase === "overdue" ? "high" : rng.pick(["low", "medium", "high"]),
      dueDate: isoDate(dueOffset),
      status,
      edgeCase,
    });
  }
  return records;
}

function genStaff(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count } = ctx;
  const vocab = VOCAB[brief.businessType];
  const people = buildPeople(rng, brief.region, count);
  return people.slice(0, count).map((p, i) => ({
    id: `staff_${pad(i + 1, 3)}`,
    name: p.name,
    role: vocab.roles[i % vocab.roles.length],
    email: `${p.first}@example.com`.toLowerCase(),
    phone: p.phone,
    active: rng.chance(0.85),
    startedAt: isoDate(-rng.int(60, 1200)),
  }));
}

function genProducts(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count } = ctx;
  const vocab = VOCAB[brief.businessType];
  return Array.from({ length: count }, (_, i) => {
    const svc = vocab.services[i % vocab.services.length];
    const price = svc.min === 0 && svc.max === 0 ? rng.int(40, 250) : rng.int(svc.min, svc.max);
    return {
      id: `prod_${pad(i + 1, 3)}`,
      name: svc.name,
      sku: `SMP-${pad(rng.int(100, 999), 3)}`,
      description: `Sample ${svc.name.toLowerCase()} (placeholder description).`,
      price,
      unit: svc.unit,
      currency: brief.region === "generic" ? "USD" : "AUD",
      active: rng.chance(0.9),
    };
  });
}

function genReviews(ctx: Ctx): SampleRecord[] {
  const { rng, brief, count, people } = ctx;
  const vocab = VOCAB[brief.businessType];
  return Array.from({ length: count }, (_, i) => {
    const p = people[i % people.length];
    const positive = rng.chance(0.75);
    const rating = positive ? rng.int(4, 5) : rng.int(2, 3);
    return {
      id: `review_${pad(i + 1, 3)}`,
      author: `${p.first} ${p.last.charAt(0)}.`,
      rating,
      service: rng.pick(vocab.services).name,
      body: positive ? rng.pick(REVIEW_SNIPPETS_POSITIVE) : rng.pick(REVIEW_SNIPPETS_MIXED),
      source: rng.pick(REVIEW_SOURCES),
      date: isoDate(-rng.int(5, 300)),
    };
  });
}

const GENERATORS: Record<DataPackId, (ctx: Ctx) => SampleRecord[]> = {
  customers: genCustomers,
  leads: genLeads,
  jobs: genJobs,
  quotes: genQuotes,
  messages: genMessages,
  tasks: genTasks,
  staff: genStaff,
  products: genProducts,
  reviews: genReviews,
};

// --- public API ------------------------------------------------------------

export function generatePacks(brief: SeedBrief): GeneratedPack[] {
  const count = QUANTITY_COUNT[brief.quantity];
  const seedKey = [
    brief.brief.trim(),
    brief.businessType,
    brief.quantity,
    brief.region,
    brief.tone,
    brief.packs.join(","),
  ].join("|");

  // Shared people pool sized to cover the largest pack.
  const peopleRng = new Rng(`${seedKey}|people`);
  const people = buildPeople(peopleRng, brief.region, Math.max(count, 6));

  return brief.packs.map((id) => {
    const rng = new Rng(`${seedKey}|${id}`);
    return {
      id,
      label: DATA_PACK_LABEL[id],
      records: GENERATORS[id]({ rng, brief, count, people }),
    };
  });
}
