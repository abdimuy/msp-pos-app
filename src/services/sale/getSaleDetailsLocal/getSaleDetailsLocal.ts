import { SaleWithSavedImages } from '../../../../type/Sale';
import { getDB, Tx } from '../../../../app/Database/database';
import * as SQLite from 'expo-sqlite';

export const getSaleDetailsLocal = async (
  id: string,
  txn?: Tx
): Promise<SaleWithSavedImages | null> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;

  const details = await database.getFirstAsync<SaleWithSavedImages>(
    `SELECT id, name, date, status, latitud, longitud FROM sale WHERE id = ?`,
    [id]
  );

  if (!details) return null;

  const details_img = await database.getAllAsync<{ id: number; url: string }>(
    `SELECT id, url FROM sale_images WHERE sale_id = ?`,
    [id]
  );

  details.images = details_img.map((img) => ({ id: img.id, url: img.url }));

  return details;
};
