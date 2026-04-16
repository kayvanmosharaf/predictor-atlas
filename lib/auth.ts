import { createServerSupabaseClient } from "./supabase/server";

export interface AuthUser {
  sub: string;
  email?: string;
  groups: string[];
  isAdmin: boolean;
}

export async function authenticateRequest(
  _request: Request
): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const role = user.app_metadata?.role;
    const groups = role === "admin" ? ["admin"] : [];
    return {
      sub: user.id,
      email: user.email,
      groups,
      isAdmin: role === "admin",
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await authenticateRequest(request);
  if (!user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (!user.isAdmin) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
