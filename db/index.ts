import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof createDb>;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // HTTP transport: one-shot queries, suited to Netlify's serverless runtime.
  return drizzle(neon(url), { schema });
}

let cached: Db | undefined;

/** Lazy so that `next build` never needs a database connection. */
export function getDb(): Db {
  cached ??= createDb();
  return cached;
}
