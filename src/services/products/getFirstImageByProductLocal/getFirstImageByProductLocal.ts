import { getDB, Tx } from '../../../../app/Database/database';
import * as SQLite from 'expo-sqlite';

export const getFirstImageByProductLocal = async (
  articulo_id: number,
  txn?: Tx
): Promise<string | null> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  const mainImage = await database.getFirstAsync<{ ruta_local: string }>(
    `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ? LIMIT 1;`,
    [articulo_id]
  );
  return mainImage ? mainImage.ruta_local : null;
};
