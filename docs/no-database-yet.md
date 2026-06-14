# No database yet for Demo Seed Factory

You chose **no database foundation** when this project was created.

## When you're ready to add one

Pick one of the existing foundations or wire something custom:

- **Supabase** (client-side apps; auth + storage + realtime included)
  - `npm install @supabase/supabase-js @supabase/ssr`
  - Reference files: `C:\Users\HN2nds\dev\templates\database\supabase-client\`

- **Neon Postgres** (internal tools; serverless Postgres, edge-friendly)
  - `npm install @neondatabase/serverless`
  - Reference files: `C:\Users\HN2nds\dev\templates\database\neon-internal\`

- **Something else** (SQLite, MySQL, Mongo, Prisma, Drizzle, ...)
  - Add the driver, create `lib/db/`, and replace this file with your own notes.

Delete this file once you've picked a backend.
