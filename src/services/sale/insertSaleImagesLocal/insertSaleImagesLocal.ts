import { Sale } from '../../../../type/Sale';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';

export const insertSaleImagesLocal = async (venta: Sale, txn?: Tx): Promise<void> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  for (const img of venta.images) {
    await database.runAsync(`INSERT INTO sale_images (sale_id, url) VALUES (?, ?);`, [
      venta.id,
      img.url,
    ]);
  }
};