import * as SQLite from 'expo-sqlite';
import { Producto } from "../../Types/Producto";

let db: SQLite.SQLiteDatabase | null = null;

export const initDB = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync('productos.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS productos (
        ARTICULO_ID INTEGER PRIMARY KEY NOT NULL,
        ARTICULO TEXT NOT NULL,
        EXISTENCIAS INTEGER NOT NULL,
        PRECIO REAL NOT NULL
      );
    `);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error; // permite que layout lo capture
  }
};

const getDB = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('La base de datos no está inicializada. Llama a initDB() primero.');
  }
  return db;
};

export const insertarProductos = async (productos: Producto[]): Promise<void> => {
  try {
    const database = getDB();
    await database.runAsync('DELETE FROM productos;');
    for (const p of productos) {
      await database.runAsync(
        `INSERT INTO productos 
         (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO) 
         VALUES (?, ?, ?, ?);`,
        [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, p.PRECIO]
      );
    }
    console.log(`${productos.length} productos insertados.`);
  } catch (error) {
    console.error('Error al insertar productos:', error);
  }
};

export const obtenerProductos = async (): Promise<Producto[]> => {
  try {
    const database = getDB();
    const resultados = await database.getAllAsync<Producto>(
      `SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos;`
    );
    console.log(`Recuperados ${resultados.length} productos.`);
    return resultados;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};
