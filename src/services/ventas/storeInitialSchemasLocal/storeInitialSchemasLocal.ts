import { getDB, Tx } from '../../../../app/database/database';
import { getTableSchemasLocal } from '../getTableSchemasLocal/getTableSchemasLocal';

export const storeInitialSchemasLocal = async (txn?: Tx): Promise<void> => {
  const db = getDB();
  const database = txn ?? db;

  await database.runAsync(`
    CREATE TABLE IF NOT EXISTS esquemas_guardados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_tabla TEXT NOT NULL,
      esquema TEXT NOT NULL,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const schemas = await getTableSchemasLocal(txn);

  for (const { name, sql } of schemas) {
    const alreadyExists = await database.getFirstAsync(
      `SELECT 1 FROM esquemas_guardados WHERE nombre_tabla = ? AND esquema = ? LIMIT 1`,
      [name, sql]
    );

    if (!alreadyExists) {
      await database.runAsync(
        `INSERT INTO esquemas_guardados (nombre_tabla, esquema) VALUES (?, ?);`,
        [name, sql]
      );
    }
  }
};

