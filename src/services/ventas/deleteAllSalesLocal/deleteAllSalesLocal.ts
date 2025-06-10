import { getDB, Tx } from '../../../../app/database/database';

export const deleteAllSalesLocal = async (txn?: Tx): Promise<void> => {
  const db = getDB();
  const database = txn ?? db;
  await database.runAsync(`DELETE FROM sale;`);
  await database.runAsync(`DELETE FROM sale_images;`);
};
