/**
 * @jest-environment node
 */
import { APIError } from "@anthropic-ai/sdk/error";
import { anthropicErrorResponse } from "@/lib/forecast/anthropic-errors";

function makeApiError(
  status: number,
  apiMessage: string,
  apiType = "invalid_request_error"
): APIError {
  const body = {
    type: "error",
    error: { type: apiType, message: apiMessage },
  };
  return new APIError(status, body, apiMessage, new Headers());
}

describe("anthropicErrorResponse", () => {
  it("returns null for non-Anthropic errors", () => {
    expect(anthropicErrorResponse(new Error("boom"))).toBeNull();
    expect(anthropicErrorResponse("nope")).toBeNull();
    expect(anthropicErrorResponse(null)).toBeNull();
  });

  it("maps a credit-balance 400 to a 402 with anthropic_billing code", async () => {
    const err = makeApiError(
      400,
      "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade."
    );

    const res = anthropicErrorResponse(err);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(402);
    const body = await res!.json();
    expect(body.code).toBe("anthropic_billing");
    expect(body.error).toMatch(/credit balance/i);
  });

  it("maps a 401 to a 502 with a clearer auth-config message", async () => {
    const err = makeApiError(401, "invalid x-api-key");
    const res = anthropicErrorResponse(err);
    expect(res!.status).toBe(502);
    const body = await res!.json();
    expect(body.code).toBe("anthropic_auth");
    expect(body.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it("maps a 429 to a 429 with anthropic_rate_limit code", async () => {
    const err = makeApiError(429, "rate limit exceeded", "rate_limit_error");
    const res = anthropicErrorResponse(err);
    expect(res!.status).toBe(429);
    const body = await res!.json();
    expect(body.code).toBe("anthropic_rate_limit");
  });

  it("maps other 4xx to a 502 with anthropic_client_error", async () => {
    const err = makeApiError(404, "not found", "not_found_error");
    const res = anthropicErrorResponse(err);
    expect(res!.status).toBe(502);
    const body = await res!.json();
    expect(body.code).toBe("anthropic_client_error");
  });

  it("maps 5xx upstream errors to a 502 with anthropic_server_error", async () => {
    const err = makeApiError(503, "upstream is down", "api_error");
    const res = anthropicErrorResponse(err);
    expect(res!.status).toBe(502);
    const body = await res!.json();
    expect(body.code).toBe("anthropic_server_error");
  });

  it("does not mistake an unrelated 400 for billing", async () => {
    const err = makeApiError(400, "messages.0.content.0: invalid format");
    const res = anthropicErrorResponse(err);
    expect(res!.status).toBe(502);
    const body = await res!.json();
    expect(body.code).toBe("anthropic_client_error");
  });
});
