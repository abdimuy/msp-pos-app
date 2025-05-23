import * as SQLite from 'expo-sqlite';

type Producto = {
  ARTICULO_ID: number;
  ARTICULO: string;
  EXISTENCIAS: number;
  PRECIO: number;
};

let db: SQLite.SQLiteDatabase;

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
    console.log('Base de datos inicializada.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    console.error('ERROR CRÍTICO: Fallo al inicializar la DB');
  }
};

export const insertarProductos = async (productos: Producto[]): Promise<void> => {
  try {
    let insertados = 0;
    for (const p of productos) {
      await db.runAsync(
        `INSERT OR REPLACE INTO productos 
         (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO) 
         VALUES (?, ?, ?, ?);`,
        [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, p.PRECIO]
      );
      insertados++;
    }
    console.log(`${insertados} productos insertados o actualizados.`);
  } catch (error) {
    console.error('Error al insertar o actualizar productos:', error);
  }
};

export const obtenerProductos = async (): Promise<Producto[]> => {
  try {
    const resultados = await db.getAllAsync<Producto>('SELECT * FROM productos;');
    console.log(`Recuperados ${resultados.length} productos.`);
    return resultados;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};
