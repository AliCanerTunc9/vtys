import mysql, { type Pool, type PoolConnection } from "mysql2/promise";

// MySQL connection pool. Settings come from the DB_* variables that
// compose.yaml passes to the Next.js container.

const globalForDb = globalThis as unknown as { __vtysPool?: Pool };

export function pool(): Pool {
  // Kept on globalThis so hot reloads in development reuse one pool.
  globalForDb.__vtysPool ??= mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3307),
    database: process.env.DB_NAME ?? "vtys",
    user: process.env.DB_USER ?? "vtys",
    password: process.env.DB_PASSWORD,
    connectionLimit: 10,
    // DECIMAL columns come back as numbers and DATE columns as "YYYY-MM-DD".
    decimalNumbers: true,
    dateStrings: true,
    charset: "utf8mb4",
  });
  return globalForDb.__vtysPool;
}

/** Runs `fn` in a transaction: commits if it returns, rolls back if it throws. */
export async function transaction<T>(
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
