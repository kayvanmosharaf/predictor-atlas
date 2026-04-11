import { NextResponse } from "next/server";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({ region: process.env.AWS_REGION ?? "us-east-2" });

export async function POST(request: Request) {
  const { predictionId } = await request.json();

  const functionName = process.env.PREDICTION_ANALYZER_FUNCTION_NAME;
  if (!functionName) {
    return NextResponse.json(
      { error: "PREDICTION_ANALYZER_FUNCTION_NAME not configured" },
      { status: 500 }
    );
  }

  try {
    const command = new InvokeCommand({
      FunctionName: functionName,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify({ predictionId })),
    });

    const response = await lambda.send(command);
    const rawPayload = response.Payload
      ? Buffer.from(response.Payload).toString()
      : null;

    if (response.FunctionError) {
      return NextResponse.json(
        { error: "Lambda execution failed", details: rawPayload },
        { status: 500 }
      );
    }

    // The Lambda returns { statusCode, body } — parse the body for analysis results
    let result = null;
    if (rawPayload) {
      try {
        result = JSON.parse(rawPayload);
      } catch {
        result = rawPayload;
      }
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Failed to invoke prediction analyzer:", err);
    return NextResponse.json(
      { error: "Failed to invoke analyzer" },
      { status: 500 }
    );
  }
}
