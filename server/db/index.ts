import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

// Kept on globalThis so dev hot reloads reuse one pool. A module-level
// variable is reset on every reload, and each orphaned pool kept its
// connections open until the database hit its connection limit.
const globalForDb = globalThis as typeof globalThis & {
  mysqlPool?: mysql.Pool | null;
};

export function getConnectionPool() {
  if (!globalForDb.mysqlPool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }

    globalForDb.mysqlPool = mysql.createPool({
      uri: connectionString,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: "local", // Use local timezone - datetime strings are stored as-is
    });
  }

  return globalForDb.mysqlPool;
}

export const db = drizzle(getConnectionPool(), { schema, mode: "default" });

// Function to test database connection
export async function testConnection() {
  try {
    const connection = await getConnectionPool().getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection() {
  if (globalForDb.mysqlPool) {
    await globalForDb.mysqlPool.end();
    globalForDb.mysqlPool = null;
  }
}
