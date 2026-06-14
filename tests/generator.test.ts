import { describe, expect, it } from "vitest";
import { buildSeedPack } from "../app/lib/build";
import { generatePacks } from "../app/lib/generator";
import { scanBrief } from "../app/lib/safety";
import type { BusinessTypeId, DataPackId, SeedBrief } from "../app/lib/types";

const ALL_PACKS: DataPackId[] = [
  "customers",
  "leads",
  "jobs",
  "quotes",
  "messages",
  "tasks",
  "staff",
  "products",
  "reviews",
];

function makeBrief(overrides: Partial<SeedBrief> = {}): SeedBrief {
  return {
    brief: "Sample plumbing business fixing leaking showers and hot water.",
    businessType: "trade",
    packs: ALL_PACKS,
    quantity: "medium",
    region: "au",
    tone: "friendly",
    ...overrides,
  };
}

// Recursively collect every string value stored under a given key.
function collectByKey(value: unknown, key: string, out: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const v of value) collectByKey(v, key, out);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === key && typeof v === "string" && v !== "") out.push(v);
      else collectByKey(v, key, out);
    }
  }
  return out;
}

function collectEdgeCases(packs: ReturnType<typeof generatePacks>): Set<string> {
  const edges = new Set<string>();
  for (const pack of packs) {
    for (const rec of pack.records) {
      const ec = (rec as { edgeCase?: string }).edgeCase;
      if (ec) edges.add(ec);
    }
  }
  return edges;
}

const SAFE_MOBILE = /^0491 57\d \d{3}$/;
const SAFE_LANDLINE = /^\(0\d\) 5550 \d{4}$/;

describe("determinism", () => {
  it("produces identical JSON for the same brief", () => {
    const b = makeBrief();
    expect(buildSeedPack(b).json).toBe(buildSeedPack(b).json);
  });

  it("produces deeply identical packs for the same brief", () => {
    const b = makeBrief();
    expect(generatePacks(b)).toEqual(generatePacks(b));
  });

  it("changes output when the brief differs", () => {
    const a = buildSeedPack(makeBrief({ brief: "Business A" }));
    const b = buildSeedPack(makeBrief({ brief: "Business B" }));
    expect(a.json).not.toBe(b.json);
  });
});

describe("safe fake data", () => {
  it("generates phone numbers only in the reserved fictional ranges", () => {
    const packs = generatePacks(makeBrief({ quantity: "large" }));
    const phones = collectByKey(packs, "phone");
    expect(phones.length).toBeGreaterThan(0);
    for (const phone of phones) {
      expect(SAFE_MOBILE.test(phone) || SAFE_LANDLINE.test(phone)).toBe(true);
    }
  });

  it("eventually produces a 5550-style landline across briefs", () => {
    const landlines: string[] = [];
    for (let i = 0; i < 12; i++) {
      const packs = generatePacks(makeBrief({ brief: `Business ${i}`, quantity: "large" }));
      for (const phone of collectByKey(packs, "phone")) {
        if (SAFE_LANDLINE.test(phone)) landlines.push(phone);
      }
    }
    expect(landlines.length).toBeGreaterThan(0);
  });

  it("generates emails only on the reserved @example.com domain", () => {
    const packs = generatePacks(makeBrief({ quantity: "large" }));
    const emails = collectByKey(packs, "email");
    expect(emails.length).toBeGreaterThan(0);
    for (const email of emails) {
      expect(email.endsWith("@example.com")).toBe(true);
    }
  });

  it("never emits real-looking credentials, sensitive IDs or unsafe contacts", () => {
    // Running the safety scanner over the generated JSON should find nothing.
    const pack = buildSeedPack(makeBrief({ quantity: "large" }));
    expect(scanBrief(pack.json)).toEqual([]);
  });
});

describe("edge cases", () => {
  it("includes all intended edge cases across the relevant packs", () => {
    const packs = generatePacks(
      makeBrief({ packs: ["leads", "jobs", "quotes", "messages", "tasks"], quantity: "medium" }),
    );
    const edges = collectEdgeCases(packs);
    for (const expected of [
      "urgent",
      "duplicate-enquiry",
      "missing-info",
      "overdue",
      "completed",
      "follow-up",
    ]) {
      expect(edges.has(expected)).toBe(true);
    }
  });
});

describe("smoke: data pack generation", () => {
  const cases: { type: BusinessTypeId; pack: DataPackId }[] = [
    { type: "trade", pack: "jobs" },
    { type: "booking", pack: "jobs" },
    { type: "crm", pack: "leads" },
  ];

  for (const { type, pack } of cases) {
    it(`generates ${pack} records for a ${type} business`, () => {
      const packs = generatePacks(makeBrief({ businessType: type, packs: [pack] }));
      expect(packs).toHaveLength(1);
      expect(packs[0].records.length).toBeGreaterThan(0);
    });
  }

  it("builds a full seed pack with all output sections populated", () => {
    const pack = buildSeedPack(makeBrief());
    expect(pack.summary.length).toBeGreaterThan(0);
    expect(pack.humanReadable.length).toBeGreaterThan(0);
    expect(pack.claudePrompt.toLowerCase()).toContain("fake");
    expect(pack.safetyNote.toUpperCase()).toContain("FAKE");
    expect(() => JSON.parse(pack.json)).not.toThrow();
  });
});
