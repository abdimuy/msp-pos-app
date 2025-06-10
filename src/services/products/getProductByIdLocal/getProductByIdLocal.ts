import { Producto } from '../../../../type/Producto';
import { getDB, Tx } from '../../../../app/database/database';  

export async function getProductByIdLocal(id: number, txn?: Tx): Promise<Producto | null> {
  const db = getDB();
  const database = txn ?? db;
  const productData = await database.getAllAsync<Producto>(
    'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos WHERE ARTICULO_ID = ?',
    [id]
  );
  return productData.length > 0 ? productData[0] : null;
}
