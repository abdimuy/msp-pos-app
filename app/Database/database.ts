import * as SQLite from 'expo-sqlite';
import { Producto } from "../../Types/Producto";
import { Sale } from "../../Types/sales"
import { UrlObject } from 'expo-router/build/global-state/routeInfo';

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
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS sale (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        status INTEGER NOT NULL CHECK (status IN (0,1))
      );`
    )
    await db.execAsync(
      ` CREATE TABLE IF NOT EXISTS sale_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sale(id) ON DELETE CASCADE
      );`
    )
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
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
  } catch (error) {
    console.error(error);
  }
};

export const obtenerProductos = async (): Promise<Producto[]> => {
  try {
    const database = getDB();
    const resultados = await database.getAllAsync<Producto>(
      `SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos;`
    );
    return resultados;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Incerta ventas en base de datos
export const insertarVenta = async (venta: Sale): Promise<void> => {
  try {
    //Guarda los datos String en la tabla sale
    const result = await db.runAsync(
      `INSERT INTO sale (name, date, status) VALUES (?, ?, ?);`,
      [venta.name, venta.date, venta.status]
    );
    const saleId = result.lastInsertRowId;

    // Guarda las imagenes capturadas
    for (const img of venta.images) {
      await db.runAsync(
        `INSERT INTO sale_images (sale_id, url) VALUES (?, ?);`,
        [saleId, img.url]
      );
    }
  } catch (error) {
    console.error(error);
  }
};

export const obtenerVentas = async (): Promise<Sale[]> => {
  try {
    const ventasBase = await db.getAllAsync<Sale>(
      `SELECT id, name, date, status FROM sale;`
    );

    for (const venta of ventasBase) {
      const imagenes = await db.getAllAsync<{ url: string }>(
        `SELECT url FROM sale_images WHERE sale_id = ?;`,
        [venta.id]
      );
      venta.images = imagenes.map(img => ({ url: img.url }));
    }

    return ventasBase;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const obtenerDetallesVenta = async (id: number): Promise<Sale | null> => {
  try {
    const db = getDB();

    const detalles = await db.getFirstAsync<Sale>(
      `SELECT id, name, date, status FROM sale WHERE id = ?`,
      [id]
    );

    if (!detalles) return null;

    const detalles_img = await db.getAllAsync<{ url: string }>(
      `SELECT url FROM sale_images WHERE sale_id = ?`,
      [id]
    );

    detalles.images = detalles_img.map(img => ({ url: img.url }));

    return detalles;
  } catch (error) {
    console.error(error);
    return null;
  }
};



//Elimina la Venta realizada, asi como sus datos(Esto incluye imagenes)
export const eliminarTodasLasVentas = async (): Promise<void> => {
  try {
    const db = getDB();
    //Elimina las tablas de las ventas
    await db.runAsync(`DELETE FROM sale;`);
    await db.runAsync(`DELETE FROM sale_images;`);
    //Elimina los cintadores de autoIncremento de las mismas
    await db.runAsync(`DELETE FROM sqlite_sequence WHERE name='sale';`);
    await db.runAsync(`DELETE FROM sqlite_sequence WHERE name='sale_images';`);
  } catch (error) {
    console.error(error);
  }
};