import { Sale, SaleBase } from '../../../../type/Sale';
import { getDB, Tx } from '../../../../app/Database/database';
import * as SQLite from 'expo-sqlite';

export const getSalesLocal = async (txn?: Tx): Promise<SaleBase[]> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  const saleList = await database.getAllAsync<Sale>(`SELECT id, name, date, status FROM sale;`);

  for (const venta of saleList) {
    const images = await database.getAllAsync<{ url: string }>(
      `SELECT url FROM sale_images WHERE sale_id = ?;`,
      [venta.id]
    );
    //venta.images = images.map((img) => ({ url: img.url }));
  }
  return saleList;
};
