// Executable entry point for the Demo Seed Factory CLI.
//
// Run via: npm run seed:generate -- --brief "..." --businessType trade-services ...
// Prints a fake/sample data pack to stdout (or to --out if provided).
// No network, no AI, no database — purely local deterministic generation.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateFromArgs, HELP_TEXT } from "./seed-cli";

function main(): void {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(`${HELP_TEXT}\n`);
    return;
  }

  let result;
  try {
    result = generateFromArgs(argv);
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n\n${HELP_TEXT}\n`);
    process.exitCode = 1;
    return;
  }

  if (result.outPath) {
    // Status goes to stderr so stdout stays clean if anything is piped.
    const full = resolve(process.cwd(), result.outPath);
    writeFileSync(full, `${result.output}\n`, "utf8");
    process.stderr.write(`Wrote ${result.format} seed pack to ${full}\n`);
  } else {
    process.stdout.write(`${result.output}\n`);
  }

  if (result.warnings.length > 0) {
    process.stderr.write(
      `\n⚠ ${result.warnings.length} safety warning(s) — the brief may contain real details. See output.\n`,
    );
  }
}

main();
