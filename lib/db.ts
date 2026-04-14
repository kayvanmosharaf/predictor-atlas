import {
  RDSDataClient,
  ExecuteStatementCommand,
  Field,
} from "@aws-sdk/client-rds-data";

const client = new RDSDataClient({ region: process.env.AWS_REGION || "us-east-2" });

const resourceArn = process.env.AURORA_CLUSTER_ARN!;
const secretArn = process.env.AURORA_SECRET_ARN!;
const database = "predictoratlas";

interface QueryResult {
  records: Record<string, unknown>[];
}

export async function query(
  sql: string,
  parameters?: { name: string; value: Field }[]
): Promise<QueryResult> {
  const command = new ExecuteStatementCommand({
    resourceArn,
    secretArn,
    database,
    sql,
    parameters: parameters?.map((p) => ({
      name: p.name,
      value: p.value,
    })),
    includeResultMetadata: true,
  });

  const response = await client.send(command);

  const columns = response.columnMetadata?.map((c) => c.name ?? "") ?? [];
  const records = (response.records ?? []).map((row) => {
    const obj: Record<string, unknown> = {};
    row.forEach((field, i) => {
      const col = columns[i];
      if (field.isNull) obj[col] = null;
      else if (field.stringValue !== undefined) obj[col] = field.stringValue;
      else if (field.longValue !== undefined) obj[col] = field.longValue;
      else if (field.doubleValue !== undefined) obj[col] = field.doubleValue;
      else if (field.booleanValue !== undefined) obj[col] = field.booleanValue;
      else obj[col] = null;
    });
    return obj;
  });

  return { records };
}

// Helper to build Field values
export function stringField(value: string): Field {
  return { stringValue: value };
}

export function numberField(value: number): Field {
  return { doubleValue: value };
}

export function nullField(): Field {
  return { isNull: true };
}

export function stringOrNull(value: string | null | undefined): Field {
  return value != null ? { stringValue: value } : { isNull: true };
}

export function numberOrNull(value: number | null | undefined): Field {
  return value != null ? { doubleValue: value } : { isNull: true };
}
