import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

const sql = neon(process.env.DATABASE_URL!);

async function userId() {
  const { data: session } = await auth.getSession();
  return session?.user?.id;
}

const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });

export async function GET() {
  const id = await userId();
  if (!id) return unauthorized();
  const rows = await sql`select data from hub_state where user_id = ${id}`;
  return Response.json({ data: rows[0]?.data ?? null });
}

export async function PUT(req: Request) {
  const id = await userId();
  if (!id) return unauthorized();
  const body = await req.text();
  if (body.length > 2_000_000) return Response.json({ error: "Too large" }, { status: 413 });
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!data || typeof data !== "object" || !Array.isArray((data as { tasks?: unknown }).tasks))
    return Response.json({ error: "Invalid state" }, { status: 400 });

  await sql`
    insert into hub_state (user_id, data, updated_at) values (${id}, ${JSON.stringify(data)}::jsonb, now())
    on conflict (user_id) do update set data = excluded.data, updated_at = now()`;
  return Response.json({ ok: true });
}
