import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

interface QueryResult {
  records: Record<string, unknown>[];
}

export type ParamValue = string | number | boolean | null;

export async function query(
  sql: string,
  parameters?: { name: string; value: ParamValue }[]
): Promise<QueryResult> {
  // Convert named parameters (:name) to positional ($1, $2, ...)
  const values: unknown[] = [];
  let idx = 0;
  const pgSql = sql.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
    const param = parameters?.find((p) => p.name === name);
    idx++;
    values.push(param?.value ?? null);
    return `$${idx}`;
  });

  const result = await pool.query(pgSql, values);
  return { records: result.rows };
}

// Helper to build parameter values
export function stringField(value: string): ParamValue {
  return value;
}

export function numberField(value: number): ParamValue {
  return value;
}

export function nullField(): ParamValue {
  return null;
}

export function stringOrNull(value: string | null | undefined): ParamValue {
  return value ?? null;
}

export function numberOrNull(value: number | null | undefined): ParamValue {
  return value ?? null;
}
