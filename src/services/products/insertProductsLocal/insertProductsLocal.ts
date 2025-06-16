import { Producto } from '../../../../type/Products';
import { getDB, Tx } from '../../../../app/database/database';
import * as SQLite from 'expo-sqlite';
import { convertPrices } from '../../../services/convertPrices';

export const insertProductsLocal = async (productos: Producto[], txn?: Tx): Promise<void> => {
  const db = getDB();
  const database: Tx | SQLite.SQLiteDatabase = txn ?? db;
  for (const p of productos) {
    const praiseObj = convertPrices(p.PRECIOS);
    const praiseJSON = JSON.stringify(praiseObj);
    await database.runAsync(
      `INSERT INTO productos (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIOS) VALUES (?, ?, ?, ?);`,
      [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, praiseJSON]
    );
  }
};
