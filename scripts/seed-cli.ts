// Core logic for the Demo Seed Factory CLI.
//
// This module is intentionally side-effect free so it can be unit tested.
// The actual executable entry point lives in generate-seed-pack.ts.
//
// It reuses the existing generator via buildSeedPack — no generation logic is
// duplicated here. The CLI only maps friendly argument names to the internal
// IDs the generator already understands, then formats the result.

import { buildSeedPack } from "../app/lib/build";
import { DATA_PACKS } from "../app/lib/catalog";
import type {
  BusinessTypeId,
  DataPackId,
  GeneratedSeedPack,
  QuantityId,
  RegionId,
  SafetyWarning,
  SeedBrief,
  ToneId,
} from "../app/lib/types";

export type Format = "json" | "human" | "claude";

export interface CliResult {
  format: Format;
  output: string;
  warnings: SafetyWarning[];
  outPath: string | null;
}

// --- argument parsing ------------------------------------------------------

// Accepts "--key value", "--key=value", and bare boolean flags ("--help").
export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (!tok.startsWith("--")) continue;
    const eq = tok.indexOf("=");
    if (eq !== -1) {
      out[tok.slice(2, eq)] = tok.slice(eq + 1);
      continue;
    }
    const key = tok.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

// --- friendly-name -> internal-id mappings ---------------------------------
// Keys are normalised (lowercased, spaces/slashes/underscores -> "-").

const BUSINESS_TYPE_ALIASES: Record<string, BusinessTypeId> = {
  trade: "trade",
  trades: "trade",
  "trade-services": "trade",
  "trade-service": "trade",
  booking: "booking",
  "booking-service": "booking",
  "booking-services": "booking",
  "booking-business": "booking",
  service: "booking",
  "service-business": "booking",
  crm: "crm",
  "lead-tracker": "crm",
  "lead-tracker-crm": "crm",
  "leads-crm": "crm",
  "lead-crm": "crm",
  health: "health",
  wellness: "health",
  "health-wellness": "health",
  professional: "professional",
  "professional-services": "professional",
  "professional-service": "professional",
  prof: "professional",
  retail: "retail",
  products: "retail",
  "retail-products": "retail",
  internal: "internal",
  "internal-operations": "internal",
  "internal-ops": "internal",
  ops: "internal",
  custom: "custom",
  other: "custom",
};

const REGION_ALIASES: Record<string, RegionId> = {
  australia: "au",
  au: "au",
  aus: "au",
  australian: "au",
  generic: "generic",
  international: "generic",
  intl: "generic",
  global: "generic",
};

const TONE_ALIASES: Record<string, ToneId> = {
  "plain-business": "professional",
  plain: "professional",
  business: "professional",
  professional: "professional",
  formal: "professional",
  "friendly-local": "friendly",
  friendly: "friendly",
  local: "friendly",
  warm: "friendly",
  casual: "casual",
  relaxed: "casual",
  chatty: "casual",
};

const QUANTITY_ALIASES: Record<string, QuantityId> = {
  small: "small",
  s: "small",
  medium: "medium",
  m: "medium",
  large: "large",
  l: "large",
};

const FORMAT_ALIASES: Record<string, Format> = {
  json: "json",
  human: "human",
  "human-readable": "human",
  readable: "human",
  claude: "claude",
  "claude-prompt": "claude",
  prompt: "claude",
};

function normalise(raw: string): string {
  return raw.toLowerCase().trim().replace(/[\s/_]+/g, "-");
}

function mapAlias<T extends string>(
  map: Record<string, T>,
  raw: string | boolean | undefined,
  fallback: T,
  label: string,
): T {
  if (raw === undefined || raw === true) return fallback;
  const value = map[normalise(String(raw))];
  if (!value) {
    const allowed = [...new Set(Object.values(map))].join(", ");
    throw new Error(`Invalid --${label} "${raw}". Allowed: ${allowed} (common aliases accepted).`);
  }
  return value;
}

function parsePacks(raw: string | boolean | undefined, fallback: DataPackId[]): DataPackId[] {
  if (raw === undefined || raw === true) return fallback;
  const ids = DATA_PACKS.map((p) => p.id);
  const parts = String(raw)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0) return fallback;
  const bad = parts.filter((p) => !ids.includes(p as DataPackId));
  if (bad.length) {
    throw new Error(`Invalid --packs value(s): ${bad.join(", ")}. Allowed: ${ids.join(", ")}.`);
  }
  return [...new Set(parts)] as DataPackId[];
}

// --- resolve a SeedBrief from parsed args ----------------------------------

export function resolveSeedBrief(args: Record<string, string | boolean>): {
  brief: SeedBrief;
  format: Format;
} {
  const brief: SeedBrief = {
    brief: typeof args.brief === "string" ? args.brief : "",
    businessType: mapAlias(BUSINESS_TYPE_ALIASES, args.businessType, "custom", "businessType"),
    packs: parsePacks(args.packs, ["customers", "leads", "jobs"]),
    quantity: mapAlias(QUANTITY_ALIASES, args.quantity, "small", "quantity"),
    region: mapAlias(REGION_ALIASES, args.region, "au", "region"),
    tone: mapAlias(TONE_ALIASES, args.tone, "professional", "tone"),
  };
  const format = mapAlias(FORMAT_ALIASES, args.format, "json", "format");
  return { brief, format };
}

// --- output rendering ------------------------------------------------------

function warningLines(warnings: SafetyWarning[]): string[] {
  if (warnings.length === 0) return [];
  return [
    "SAFETY WARNINGS — your brief may contain real details. Replace before sharing:",
    ...warnings.map((w) => `  - ${w.message}`),
  ];
}

export function renderOutput(format: Format, result: GeneratedSeedPack): string {
  if (format === "json") {
    // A wrapped object so the JSON itself is clearly marked fake/sample only.
    return JSON.stringify(
      {
        _safety: result.safetyNote,
        _note: "Fake/sample data only. Generated locally by Demo Seed Factory. Do not use real client data.",
        summary: result.summary,
        warnings: result.warnings,
        data: JSON.parse(result.json),
      },
      null,
      2,
    );
  }

  if (format === "human") {
    return [result.safetyNote, ...warningLines(result.warnings), "", result.humanReadable]
      .join("\n")
      .trim();
  }

  // claude
  const warn = warningLines(result.warnings);
  const banner = warn.length ? ["<!--", ...warn, "-->", ""] : [];
  return [...banner, result.claudePrompt].join("\n");
}

// --- top-level CLI run (pure: returns text, performs no I/O) ----------------

export function generateFromArgs(argv: string[]): CliResult {
  const args = parseArgs(argv);
  const { brief, format } = resolveSeedBrief(args);
  const result = buildSeedPack(brief);
  return {
    format,
    output: renderOutput(format, result),
    warnings: result.warnings,
    outPath: typeof args.out === "string" ? args.out : null,
  };
}

export const HELP_TEXT = `Demo Seed Factory — local fake/sample data generator (CLI)

Usage:
  npm run seed:generate -- [options]

Options:
  --brief "text"           Short project/business brief (scanned for real details)
  --businessType <type>    trade-services | booking | crm | health | professional |
                           retail | internal | custom        (default: custom)
  --packs <a,b,c>          customers,leads,jobs,quotes,messages,tasks,staff,products,reviews
                           (default: customers,leads,jobs)
  --quantity <size>        small | medium | large             (default: small)
  --region <region>        australia | generic                (default: australia)
  --tone <tone>            plain-business | friendly-local | casual (default: plain-business)
  --format <format>        json | human | claude              (default: json)
  --out <path>             Optional: write output to a file instead of stdout
  --help                   Show this help

All output is FAKE / SAMPLE data only — never real client data.`;
