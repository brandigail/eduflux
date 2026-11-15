import { getSessionUser, type SessionUser } from "@/lib/session";

export type AuthResult = { user: SessionUser; response?: never } | { user?: never; response: Response };

/** Route-handler guard for student-only endpoints. */
export async function requireStudent(): Promise<AuthResult> {
  const user = await getSessionUser();
  if (!user) return { response: Response.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (user.role !== "STUDENT") {
    return { response: Response.json({ error: "Only students have progress." }, { status: 403 }) };
  }
  return { user };
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}
