import { CognitoJwtVerifier } from "aws-jwt-verify";
import amplifyOutputs from "@/amplify_outputs.json";

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    const userPoolId =
      process.env.COGNITO_USER_POOL_ID || amplifyOutputs.auth.user_pool_id;
    const clientId =
      process.env.COGNITO_CLIENT_ID || amplifyOutputs.auth.user_pool_client_id;
    verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: "access",
      clientId,
    });
  }
  return verifier;
}

export interface AuthUser {
  sub: string;
  email?: string;
  groups: string[];
  isAdmin: boolean;
}

export async function authenticateRequest(
  request: Request
): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.slice(7);
    const payload = await getVerifier().verify(token);
    const groups =
      (payload["cognito:groups"] as string[] | undefined) ?? [];
    return {
      sub: payload.sub,
      email: payload.email as string | undefined,
      groups,
      isAdmin: groups.includes("admin"),
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
