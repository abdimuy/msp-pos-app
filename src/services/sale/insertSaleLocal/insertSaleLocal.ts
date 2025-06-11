import { Sale } from '../../../../type/Sale';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';

export const insertSaleLocal = async (venta: Sale, txn?: Tx): Promise<void> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  await database.runAsync(`INSERT INTO sale (id, name, date, status) VALUES (?, ?, ?, ?);`, [
    venta.id,
    venta.name,
    venta.date,
    venta.status,
  ]);
};