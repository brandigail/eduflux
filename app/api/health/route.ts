import { sql } from 'drizzle-orm'
import { db } from '@/db'

export async function GET() {
  try {
    const result = await db.execute(sql`select now() as now, current_database() as database`)
    return Response.json({ ok: true, db: result.rows[0] })
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  }
}
