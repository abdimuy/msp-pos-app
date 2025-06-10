import { Producto } from '../../../../type/Products';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';

export const insertProductsLocal = async (productos: Producto[], txn?: Tx): Promise<void> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  for (const p of productos) {
    await database.runAsync(
      `INSERT INTO productos (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO) VALUES (?, ?, ?, ?);`,
      [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, p.PRECIO]
    );
  }
};
