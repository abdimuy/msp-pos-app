import { Producto } from '../../../../type/Products';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';

export const getProductsLocal = async (txn?: Tx): Promise<Producto[]> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  const products = await database.getAllAsync<Producto>(
    'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIOS FROM productos;'
  );

  return products;
};
