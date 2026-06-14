This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Using Demo Seed Factory from Claude Code

You don't need the browser UI to generate sample data. A local CLI lets another
Claude Code session (or you) generate a fake/sample data pack straight from the
terminal during a build — no network, no AI calls, no database.

```bash
npm run seed:generate -- \
  --brief "leaking shower repair lead tracker" \
  --businessType trade-services \
  --packs customers,leads,jobs,messages \
  --quantity small \
  --region australia \
  --tone friendly-local \
  --format json
```

By default it prints a clean JSON seed pack to stdout. Switch the output with
`--format`:

```bash
npm run seed:generate -- --brief "dog walking business" --businessType booking --format human
npm run seed:generate -- --brief "dog walking business" --businessType booking --format claude
```

### Arguments

| Flag | Values | Default |
| --- | --- | --- |
| `--brief` | free text (scanned for real details) | empty |
| `--businessType` | `trade-services`, `booking`, `crm`, `health`, `professional`, `retail`, `internal`, `custom` | `custom` |
| `--packs` | comma list of `customers,leads,jobs,quotes,messages,tasks,staff,products,reviews` | `customers,leads,jobs` |
| `--quantity` | `small`, `medium`, `large` | `small` |
| `--region` | `australia`, `generic` | `australia` |
| `--tone` | `plain-business`, `friendly-local`, `casual` | `plain-business` |
| `--format` | `json`, `human`, `claude` | `json` |
| `--out` | optional file path to write to instead of stdout | — |

Run `npm run seed:generate -- --help` for the full list. Common aliases are
accepted (e.g. `trade`, `au`, `professional`).

### Safety

All output is clearly marked **fake/sample data only** and uses reserved
fictional contact details (phone numbers in reserved fictional ranges, emails on
`@example.com`, invented suburbs). The CLI runs the same safety scanner as the
UI: if your `--brief` looks like it contains real details (emails, phone
numbers, sensitive IDs, credentials), warnings are included in the output and
printed to stderr. Never paste real client data — replace it with samples first.

> Tip for Claude: to seed a prototype, run the command above with `--format claude`
> and paste the result into the build, or `--format json` to drop straight into
> fixtures/mocks.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
