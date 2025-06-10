import { getDB, Tx } from '../../../../app/database/database';  

export const deleteProductsLocal = async (txn?: Tx): Promise<void> => {
  const db = getDB();
  const database = txn ?? db;
  await database.runAsync('DELETE FROM productos;');
};
