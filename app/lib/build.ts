// Ties generation + safety + formatting into a single GeneratedSeedPack.

import { BUSINESS_TYPE_LABEL } from "./catalog";
import { generatePacks } from "./generator";
import { scanBrief } from "./safety";
import type { GeneratedPack, GeneratedSeedPack, SampleRecord, SeedBrief } from "./types";

const EDGE_CASE_LABELS: Record<string, string> = {
  urgent: "urgent lead",
  "duplicate-enquiry": "duplicate enquiry",
  "missing-info": "missing information",
  overdue: "overdue",
  completed: "completed",
  "follow-up": "follow-up reminder",
};

function collectEdgeCases(packs: GeneratedPack[]): string[] {
  const found = new Set<string>();
  for (const pack of packs) {
    for (const rec of pack.records) {
      const ec = (rec as { edgeCase?: string }).edgeCase;
      if (ec && EDGE_CASE_LABELS[ec]) found.add(EDGE_CASE_LABELS[ec]);
    }
  }
  return [...found];
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "object") return `${value.length} item(s)`;
    return value.join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function recordToLines(rec: SampleRecord): string {
  return Object.entries(rec)
    .filter(([, v]) => !(v === undefined))
    .map(([k, v]) => `  ${k}: ${formatValue(v)}`)
    .join("\n");
}

function buildHumanReadable(brief: SeedBrief, packs: GeneratedPack[]): string {
  const lines: string[] = [];
  lines.push("=== SAMPLE / FAKE DATA — NOT REAL ===");
  lines.push(`Business type: ${BUSINESS_TYPE_LABEL[brief.businessType]}`);
  lines.push(`Quantity: ${brief.quantity} · Region: ${brief.region} · Tone: ${brief.tone}`);
  lines.push("");
  for (const pack of packs) {
    lines.push(`## ${pack.label} (${pack.records.length})`);
    pack.records.forEach((rec, i) => {
      lines.push(`- [${i + 1}]`);
      lines.push(recordToLines(rec));
    });
    lines.push("");
  }
  lines.push("Reminder: all values above are fake/sample data for prototypes only.");
  return lines.join("\n");
}

function buildClaudePrompt(brief: SeedBrief, packs: GeneratedPack[], edgeCases: string[]): string {
  const packList = packs.map((p) => `${p.label} (${p.records.length})`).join(", ");
  return [
    "Use the following SAMPLE / FAKE seed data to populate the prototype.",
    "",
    `Business type: ${BUSINESS_TYPE_LABEL[brief.businessType]}`,
    `Data packs: ${packList}`,
    edgeCases.length ? `Edge cases included: ${edgeCases.join(", ")}.` : "",
    "",
    "Rules:",
    "- This is fake/sample data only. Do NOT treat any value as real.",
    "- Do NOT invent real names, real phone numbers, real emails, or sensitive IDs.",
    "- Keep the data wired to realistic empty, overdue, urgent and completed states.",
    "- Match the JSON shape below when seeding components, mocks or fixtures.",
    "",
    "JSON seed data:",
    "```json",
    JSON.stringify(toJsonShape(packs), null, 2),
    "```",
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function toJsonShape(packs: GeneratedPack[]): Record<string, SampleRecord[]> {
  const out: Record<string, SampleRecord[]> = {};
  for (const pack of packs) {
    // Strip undefined edgeCase noise from the JSON for clean fixtures.
    out[pack.id] = pack.records.map((rec) => {
      const clean: SampleRecord = {};
      for (const [k, v] of Object.entries(rec)) {
        if (v !== undefined) clean[k] = v;
      }
      return clean;
    });
  }
  return out;
}

const SAFETY_NOTE =
  "⚠ FAKE / SAMPLE DATA ONLY. Everything generated here is fictional and for prototype demos only. " +
  "Phone numbers use ranges reserved for fictional use, emails use the reserved @example.com domain, and " +
  "addresses use invented suburbs. Do not use this data as if it were real, and never replace it with real " +
  "client names, contact details, credentials, or sensitive identifiers (TFN, Medicare, ABN, BSB, licence, bank/card numbers).";

export function buildSeedPack(brief: SeedBrief): GeneratedSeedPack {
  const packs = generatePacks(brief);
  const warnings = scanBrief(brief.brief);
  const edgeCases = collectEdgeCases(packs);

  const total = packs.reduce((s, p) => s + p.records.length, 0);
  const summary =
    `${total} sample records across ${packs.length} pack(s) for a ` +
    `${BUSINESS_TYPE_LABEL[brief.businessType]} prototype` +
    (edgeCases.length ? `. Edge cases: ${edgeCases.join(", ")}.` : ".");

  return {
    summary,
    packs,
    humanReadable: buildHumanReadable(brief, packs),
    json: JSON.stringify(toJsonShape(packs), null, 2),
    claudePrompt: buildClaudePrompt(brief, packs, edgeCases),
    safetyNote: SAFETY_NOTE,
    warnings,
  };
}
