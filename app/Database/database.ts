import * as SQLite from 'expo-sqlite';
import { storeInitialSchemasLocal } from '../../src/services/sale/storeInitialSchemasLocal/storeInitialSchemasLocal';

let db: SQLite.SQLiteDatabase;

 export type Tx = Parameters<typeof db.withExclusiveTransactionAsync>[0] extends (tx: infer T) => any
   ? T
   : never;

export const initDB = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('productos.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS productos (
        ARTICULO_ID INTEGER PRIMARY KEY NOT NULL,
        ARTICULO TEXT NOT NULL, 
        EXISTENCIAS INTEGER NOT NULL,
        PRECIOS TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS articulos_imagenes (
        imagen_id INTEGER PRIMARY KEY,
        articulo_id INTEGER NOT NULL,
        ruta_local TEXT NOT NULL UNIQUE,
        FOREIGN KEY (articulo_id) REFERENCES productos(ARTICULO_ID)
      );
    `);

    console.log('Base de datos inicializada correctamente.');
    
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS sale (
          id VARCHAR(50) PRIMARY KEY,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          status INTEGER NOT NULL CHECK (status IN (0,1))
        );`
    );
    await db.execAsync(
      ` CREATE TABLE IF NOT EXISTS sale_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sale_id INTEGER NOT NULL,
          url TEXT NOT NULL,
          FOREIGN KEY (sale_id) REFERENCES sale(id) ON DELETE CASCADE
        );`
    );

    await storeInitialSchemasLocal();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

export const getDB = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('La base de datos no está inicializada. Llama a initDB() primero.');
  }
  return db;
};