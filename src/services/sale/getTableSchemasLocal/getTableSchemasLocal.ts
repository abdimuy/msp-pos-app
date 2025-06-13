import { getDB, Tx } from '../../../../app/Database/database';
import * as SQLite from 'expo-sqlite';

export const getTableSchemasLocal = async (
  txn?: Tx
): Promise<Array<{ name: string; sql: string }>> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  return await database.getAllAsync<{ name: string; sql: string }>(
    `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'esquemas_guardados';`
  );
};
