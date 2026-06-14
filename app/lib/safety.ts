// Scans a pasted brief for things that look like REAL personal or sensitive
// details, so the operator is warned before any of it leaks into sample data.
// This is a best-effort heuristic, not a guarantee.

import type { SafetyWarning } from "./types";

interface Rule {
  kind: string;
  test: RegExp;
  message: string;
}

// Simple keyword/pattern rules (run as-is against the text).
const RULES: Rule[] = [
  {
    kind: "email",
    // Any email that is not the safe @example.com sample domain.
    test: /\b[A-Za-z0-9._%+-]+@(?!example\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    message:
      "The brief contains what looks like a real email address. Replace it with a sample @example.com address before generating or sharing.",
  },
  {
    kind: "sensitive-id",
    test: /\b(tfn|medicare|abn|acn|bsb|passport|licence|license|drivers?\s*licen[cs]e)\b/i,
    message:
      "The brief mentions a sensitive identifier (e.g. TFN, Medicare, ABN, BSB, passport, licence). Never put real identifiers into sample data.",
  },
  {
    kind: "credential",
    test: /\b(password|api[\s_-]?key|secret|token|bank\s*account|account\s*number|credit\s*card|card\s*number|cvv|pin)\b/i,
    message:
      "The brief mentions credentials or financial details (e.g. password, API key, bank/account/card number). Remove these — sample data must never contain real secrets.",
  },
];

// The app's own reserved-fictional phone formats and ISO dates. These are
// stripped before phone detection so the scanner never flags the safe values
// the generator itself produces (or ordinary dates, which are not phones).
const SAFE_NUMERIC_PATTERNS: RegExp[] = [
  /\b0491\s?57\d\s?\d{3}\b/g, // AU fictional mobile  0491 57x xxx
  /\(0\d\)\s?5550\s?\d{4}/g, // AU fictional landline (0x) 5550 xxxx
  /\+?1?\s?555[-\s]?01\d{2}\b/g, // generic fictional     555-01xx
  /\b\d{4}-\d{2}-\d{2}\b/g, // ISO date              YYYY-MM-DD
];

// A real-looking phone: 8+ digits grouped by spaces, (), -, or a leading +.
// The lookbehind stops a match starting in the middle of a longer number.
const PHONE_PATTERN = /(?<!\d)\+?\d[\d\s().-]{7,}\d/;

function phoneWarning(text: string): boolean {
  let cleaned = text;
  for (const p of SAFE_NUMERIC_PATTERNS) cleaned = cleaned.replace(p, " ");
  return PHONE_PATTERN.test(cleaned);
}

export function scanBrief(brief: string): SafetyWarning[] {
  const text = brief ?? "";
  const warnings: SafetyWarning[] = [];

  // Email first to preserve prior ordering.
  if (RULES[0].test.test(text)) {
    warnings.push({ kind: RULES[0].kind, message: RULES[0].message });
  }

  if (phoneWarning(text)) {
    warnings.push({
      kind: "phone",
      message:
        "The brief contains a long number sequence that may be a real phone number. Use a clearly fake number instead.",
    });
  }

  for (const rule of RULES.slice(1)) {
    if (rule.test.test(text)) {
      warnings.push({ kind: rule.kind, message: rule.message });
    }
  }

  return warnings;
}
