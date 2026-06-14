"use client";

import { useMemo, useState } from "react";
import CopyButton from "./components/CopyButton";
import {
  BUSINESS_TYPES,
  DATA_PACKS,
  QUANTITIES,
  REGIONS,
  TONES,
} from "./lib/catalog";
import { buildSeedPack } from "./lib/build";
import { EXAMPLES } from "./lib/examples";
import { scanBrief } from "./lib/safety";
import type {
  BusinessTypeId,
  DataPackId,
  GeneratedSeedPack,
  QuantityId,
  RegionId,
  ToneId,
} from "./lib/types";

type Tab = "human" | "json" | "prompt";

export default function Home() {
  const [brief, setBrief] = useState("");
  const [businessType, setBusinessType] = useState<BusinessTypeId>("trade");
  const [packs, setPacks] = useState<DataPackId[]>(["customers", "jobs"]);
  const [quantity, setQuantity] = useState<QuantityId>("medium");
  const [region, setRegion] = useState<RegionId>("au");
  const [tone, setTone] = useState<ToneId>("friendly");
  const [result, setResult] = useState<GeneratedSeedPack | null>(null);
  const [tab, setTab] = useState<Tab>("human");
  const [error, setError] = useState<string | null>(null);

  // Live safety scan of the current brief (before generating).
  const liveWarnings = useMemo(() => scanBrief(brief), [brief]);

  function togglePack(id: DataPackId) {
    setPacks((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function loadExample(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setBrief(ex.brief);
    setBusinessType(ex.businessType);
    setPacks(ex.packs);
    setQuantity(ex.quantity);
    setTone(ex.tone);
    setResult(null);
    setError(null);
  }

  function generate() {
    if (packs.length === 0) {
      setError("Select at least one data pack.");
      return;
    }
    setError(null);
    setResult(
      buildSeedPack({ brief, businessType, packs, quantity, region, tone }),
    );
    setTab("human");
  }

  const activeText =
    result &&
    (tab === "human"
      ? result.humanReadable
      : tab === "json"
        ? result.json
        : result.claudePrompt);

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Demo Seed Factory
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Generate safe fake/sample data packs for AutomationBeast prototypes.
            Local-only · deterministic · no real client data.
          </p>
        </header>

        {/* Examples */}
        <section className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Load an example brief
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => loadExample(ex.id)}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ---- Inputs ---- */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <label className="mb-1.5 block text-sm font-medium">
              Project / business brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              placeholder="Paste a short description of the business or prototype you're building…"
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            />

            {liveWarnings.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                <p className="font-semibold">
                  Possible real details in your brief — replace before sharing:
                </p>
                <ul className="mt-1 list-disc pl-4">
                  {liveWarnings.map((w) => (
                    <li key={w.kind}>{w.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Business type">
                <select
                  value={businessType}
                  onChange={(e) =>
                    setBusinessType(e.target.value as BusinessTypeId)
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Quantity">
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value as QuantityId)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {QUANTITIES.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Region">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as RegionId)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tone">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ToneId)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  {TONES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Data packs</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {DATA_PACKS.map((p) => {
                  const checked = packs.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        checked
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePack(p.id)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-medium">{p.label}</span>
                        <span
                          className={`block text-xs ${checked ? "opacity-80" : "text-zinc-500"}`}
                        >
                          {p.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="button"
              onClick={generate}
              className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Generate sample data
            </button>
          </section>

          {/* ---- Output ---- */}
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            {!result ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-sm text-zinc-500">
                <p className="font-medium">No data generated yet.</p>
                <p className="mt-1">
                  Pick a business type and data packs, then press Generate.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {result.summary}
                </p>

                {/* Safety note */}
                <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                  {result.safetyNote}
                </div>

                {result.warnings.length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                    <p className="font-semibold">
                      Your brief may contain real details:
                    </p>
                    <ul className="mt-1 list-disc pl-4">
                      {result.warnings.map((w) => (
                        <li key={w.kind}>{w.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tabs */}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
                    {(
                      [
                        ["human", "Human-readable"],
                        ["json", "JSON"],
                        ["prompt", "Claude prompt"],
                      ] as [Tab, string][]
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          tab === id
                            ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {activeText && <CopyButton text={activeText} />}
                </div>

                <pre className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                  {activeText}
                </pre>
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-zinc-400">
          Demo Seed Factory · fake/sample data only · phase one
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
