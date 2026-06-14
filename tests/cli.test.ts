import { describe, expect, it } from "vitest";
import { generateFromArgs, parseArgs, resolveSeedBrief } from "../scripts/seed-cli";

const BASE = [
  "--brief",
  "leaking shower repair lead tracker",
  "--businessType",
  "trade-services",
  "--packs",
  "customers,leads,jobs,messages",
  "--quantity",
  "small",
  "--region",
  "australia",
  "--tone",
  "friendly-local",
];

describe("CLI arg parsing & mapping", () => {
  it("parses --key value, --key=value and boolean flags", () => {
    const args = parseArgs(["--brief", "hello world", "--quantity=large", "--help"]);
    expect(args.brief).toBe("hello world");
    expect(args.quantity).toBe("large");
    expect(args.help).toBe(true);
  });

  it("maps friendly names to internal generator IDs", () => {
    const { brief, format } = resolveSeedBrief(parseArgs(BASE));
    expect(brief.businessType).toBe("trade");
    expect(brief.region).toBe("au");
    expect(brief.tone).toBe("friendly");
    expect(brief.quantity).toBe("small");
    expect(brief.packs).toEqual(["customers", "leads", "jobs", "messages"]);
    expect(format).toBe("json");
  });

  it("applies sensible defaults when args are omitted", () => {
    const { brief, format } = resolveSeedBrief(parseArgs(["--brief", "x"]));
    expect(brief.businessType).toBe("custom");
    expect(brief.packs).toEqual(["customers", "leads", "jobs"]);
    expect(brief.region).toBe("au");
    expect(brief.tone).toBe("professional");
    expect(format).toBe("json");
  });

  it("rejects invalid values", () => {
    expect(() => resolveSeedBrief(parseArgs(["--businessType", "spaceship"]))).toThrow();
    expect(() => resolveSeedBrief(parseArgs(["--packs", "customers,unicorns"]))).toThrow();
    expect(() => resolveSeedBrief(parseArgs(["--format", "xml"]))).toThrow();
  });
});

describe("CLI output", () => {
  it("returns valid JSON by default", () => {
    const r = generateFromArgs(BASE);
    expect(r.format).toBe("json");
    expect(() => JSON.parse(r.output)).not.toThrow();
    const parsed = JSON.parse(r.output);
    expect(parsed.data.customers.length).toBeGreaterThan(0);
  });

  it("uses reserved @example.com emails and no other domain", () => {
    const parsed = JSON.parse(generateFromArgs(BASE).output);
    const emails: string[] = [];
    for (const records of Object.values(parsed.data) as Record<string, unknown>[][]) {
      for (const rec of records) {
        const e = (rec as { email?: string }).email;
        if (typeof e === "string" && e !== "") emails.push(e);
      }
    }
    expect(emails.length).toBeGreaterThan(0);
    for (const e of emails) expect(e.endsWith("@example.com")).toBe(true);
  });

  it("clearly marks output as fake/sample data in every format", () => {
    for (const fmt of ["json", "human", "claude"] as const) {
      const out = generateFromArgs([...BASE, "--format", fmt]).output;
      expect(out.toLowerCase()).toContain("fake");
      expect(out.toLowerCase()).toContain("sample");
    }
  });

  it("produces human and claude formats with their expected headers", () => {
    const human = generateFromArgs([...BASE, "--format", "human"]).output;
    expect(human).toContain("SAMPLE / FAKE DATA");
    const claude = generateFromArgs([...BASE, "--format", "claude"]).output;
    expect(claude).toContain("SAMPLE / FAKE seed data");
  });

  it("flags real-looking details in the brief and includes them in JSON", () => {
    const args = [
      "--brief",
      "client is jane.doe@gmail.com call 0412 345 678",
      "--businessType",
      "trade-services",
    ];
    const r = generateFromArgs(args);
    const kinds = r.warnings.map((w) => w.kind);
    expect(kinds).toContain("email");
    expect(kinds).toContain("phone");
    const parsed = JSON.parse(r.output);
    expect(parsed.warnings.length).toBeGreaterThan(0);
  });

  it("does not flag the app's own safe sample brief", () => {
    const r = generateFromArgs(["--brief", "a friendly dog walking business", "--businessType", "booking"]);
    expect(r.warnings).toEqual([]);
  });

  it("captures --out path without writing during arg resolution", () => {
    const r = generateFromArgs([...BASE, "--out", "seed.json"]);
    expect(r.outPath).toBe("seed.json");
  });
});
