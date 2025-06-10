import { getDB, Tx } from '../../../../app/database/database'; 

export const getImagePathsByProductLocal = async (
  articulo_id: number,
  txn?: Tx
): Promise<string[]> => {
  const db = getDB();
  const database = txn ?? db;
  const rutasLocales = await database.getAllAsync<{ ruta_local: string }>(
    `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ?;`,
    [articulo_id]
  );
  return rutasLocales.map((r) => r.ruta_local);
};
