import { Producto } from '../../../../type/Producto';
import { getDB, Tx } from '../../../../app/database/database';  

export const insertProductsLocal = async (productos: Producto[], txn?: Tx): Promise<void> => {
  const db = getDB();
  const database = txn ?? db;

  for (const p of productos) {
    await database.runAsync(
      `INSERT INTO productos (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO) VALUES (?, ?, ?, ?);`,
      [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, p.PRECIO]
    );
  }
};