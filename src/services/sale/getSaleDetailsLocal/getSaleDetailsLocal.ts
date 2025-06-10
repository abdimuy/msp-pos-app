import { Sale } from '../../../../type/Sale';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';

export const getSaleDetailsLocal = async (id: number, txn?: Tx): Promise<Sale | null> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;

  const details = await database.getFirstAsync<Sale>(
    `SELECT id, name, date, status FROM sale WHERE id = ?`,
    [id]
  );

  if (!details) return null;

  const details_img = await database.getAllAsync<{ url: string }>(
    `SELECT url FROM sale_images WHERE sale_id = ?`,
    [id]
  );

  details.images = details_img.map((img) => ({ url: img.url }));

  return details;
};
