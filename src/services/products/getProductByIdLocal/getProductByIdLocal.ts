import { Producto } from '../../../../type/Products';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';

export async function getProductByIdLocal(id: number, txn?: Tx): Promise<Producto | null> {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  const productData = await database.getAllAsync<Producto>(
    'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos WHERE ARTICULO_ID = ?',
    [id]
  );
  return productData.length > 0 ? productData[0] : null;
}
