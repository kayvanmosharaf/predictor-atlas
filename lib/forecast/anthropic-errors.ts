import { NextResponse } from "next/server";
import { APIError } from "@anthropic-ai/sdk/error";

interface AnthropicErrorBody {
  error?: { message?: string; type?: string };
}

function extractMessage(err: APIError): string {
  const body = err.error as AnthropicErrorBody | undefined;
  return body?.error?.message ?? err.message ?? "Anthropic API error";
}

export function anthropicErrorResponse(err: unknown): NextResponse | null {
  if (!(err instanceof APIError)) return null;

  const message = extractMessage(err);
  const lower = message.toLowerCase();

  if (
    err.status === 400 &&
    (lower.includes("credit balance") || lower.includes("billing"))
  ) {
    return NextResponse.json(
      { error: message, code: "anthropic_billing" },
      { status: 402 }
    );
  }

  if (err.status === 401) {
    return NextResponse.json(
      {
        error: "Anthropic API authentication failed (check ANTHROPIC_API_KEY)",
        code: "anthropic_auth",
      },
      { status: 502 }
    );
  }

  if (err.status === 429) {
    return NextResponse.json(
      { error: message, code: "anthropic_rate_limit" },
      { status: 429 }
    );
  }

  if (typeof err.status === "number" && err.status >= 400 && err.status < 500) {
    return NextResponse.json(
      { error: message, code: "anthropic_client_error" },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { error: message, code: "anthropic_server_error" },
    { status: 502 }
  );
}
