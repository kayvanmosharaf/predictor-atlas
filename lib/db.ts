import {
  RDSDataClient,
  ExecuteStatementCommand,
  Field,
} from "@aws-sdk/client-rds-data";
import pg from "pg";

const useDataApi = !!process.env.AURORA_CLUSTER_ARN;

// RDS Data API client (production)
const rdsClient = useDataApi
  ? new RDSDataClient({ region: process.env.AWS_REGION || "us-east-2" })
  : null;
const resourceArn = process.env.AURORA_CLUSTER_ARN ?? "";
const secretArn = process.env.AURORA_SECRET_ARN ?? "";
const database = "predictoratlas";

// pg Pool (local dev)
const pool = !useDataApi
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : null;

interface QueryResult {
  records: Record<string, unknown>[];
}

export async function query(
  sql: string,
  parameters?: { name: string; value: Field }[]
): Promise<QueryResult> {
  if (useDataApi) {
    return queryDataApi(sql, parameters);
  }
  return queryPg(sql, parameters);
}

async function queryDataApi(
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

  const response = await rdsClient!.send(command);

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

async function queryPg(
  sql: string,
  parameters?: { name: string; value: Field }[]
): Promise<QueryResult> {
  // Convert named parameters (:name) to positional ($1, $2, ...)
  const values: unknown[] = [];
  let idx = 0;
  const pgSql = sql.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
    const param = parameters?.find((p) => p.name === name);
    if (!param) return `$${++idx}`;
    idx++;
    const field = param.value;
    if (field.isNull) values.push(null);
    else if (field.stringValue !== undefined) values.push(field.stringValue);
    else if (field.doubleValue !== undefined) values.push(field.doubleValue);
    else if (field.longValue !== undefined) values.push(field.longValue);
    else if (field.booleanValue !== undefined) values.push(field.booleanValue);
    else values.push(null);
    return `$${idx}`;
  });

  const result = await pool!.query(pgSql, values);
  return { records: result.rows };
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
