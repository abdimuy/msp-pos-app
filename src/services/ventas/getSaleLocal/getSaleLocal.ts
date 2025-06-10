import { Sale } from '../../../../type/Sales';
import { getDB, Tx } from '../../../../app/database/database';  

export const getSaleLocal = async (txn?: Tx): Promise<Sale[]> => {
  const db = getDB();
  const database = txn ?? db;
  const saleList = await database.getAllAsync<Sale>(`SELECT id, name, date, status FROM sale;`);

  for (const venta of saleList) {
    const images = await database.getAllAsync<{ url: string }>(
      `SELECT url FROM sale_images WHERE sale_id = ?;`,
      [venta.id]
    );
    venta.images = images.map((img) => ({ url: img.url }));
  }
  return saleList;
};
