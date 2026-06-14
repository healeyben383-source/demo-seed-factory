// Shared types for Demo Seed Factory.
// Phase one is local-only and deterministic — no database, no network.

export type BusinessTypeId =
  | "trade"
  | "booking"
  | "crm"
  | "health"
  | "professional"
  | "retail"
  | "internal"
  | "custom";

export type DataPackId =
  | "customers"
  | "leads"
  | "jobs"
  | "quotes"
  | "messages"
  | "tasks"
  | "staff"
  | "products"
  | "reviews";

export type QuantityId = "small" | "medium" | "large";
export type RegionId = "au" | "generic";
export type ToneId = "friendly" | "professional" | "casual";

export interface SeedBrief {
  brief: string;
  businessType: BusinessTypeId;
  packs: DataPackId[];
  quantity: QuantityId;
  region: RegionId;
  tone: ToneId;
}

// A generated record is an open record of safe sample fields.
export type SampleRecord = Record<string, unknown>;

export interface GeneratedPack {
  id: DataPackId;
  label: string;
  records: SampleRecord[];
}

export interface SafetyWarning {
  kind: string;
  message: string;
}

export interface GeneratedSeedPack {
  summary: string;
  packs: GeneratedPack[];
  humanReadable: string;
  json: string;
  claudePrompt: string;
  safetyNote: string;
  warnings: SafetyWarning[];
}
