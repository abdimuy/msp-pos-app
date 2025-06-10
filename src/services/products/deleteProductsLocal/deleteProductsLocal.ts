import { getDB, Tx } from '../../../../app/database/database'; 
import * as SQLite from 'expo-sqlite';

export const deleteProductsLocal = async (txn?: Tx): Promise<void> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  await database.runAsync('DELETE FROM productos;');
};
