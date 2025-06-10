import { Producto } from '../../../../type/Producto';
import { getDB, Tx } from '../../../../app/database/database';  

export const getProductsLocal = async (txn?: Tx): Promise<Producto[]> => {
  const db = getDB();
  const database = txn ?? db;

  const products = await database.getAllAsync<Producto>(
    'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos;'
  );

  return products;
};
