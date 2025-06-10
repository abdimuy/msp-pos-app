import { Sale } from '../../../../type/Sale';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';

const insertSaleLocal = async (venta: Sale, txn?: Tx): Promise<void> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  await database.runAsync(`INSERT INTO sale (id, name, date, status) VALUES (?, ?, ?, ?);`, [
    venta.id,
    venta.name,
    venta.date,
    venta.status,
  ]);
};

const insertSaleImagesLocal = async (venta: Sale, txn?: Tx): Promise<void> => {
  const db = getDB();
  const database = txn ?? db;
  for (const img of venta.images) {
    await database.runAsync(`INSERT INTO sale_images (sale_id, url) VALUES (?, ?);`, [
      venta.id,
      img.url,
    ]);
  }
};

export const SaveSaleCompleteLocal = async (venta: Sale, txn?: Tx): Promise<void> => {
  await insertSaleLocal(venta, txn);
  await insertSaleImagesLocal(venta, txn);
};
