import * as SQLite from 'expo-sqlite';
import { Producto } from "../../Types/Producto";
import { Sale } from "../../Types/sales"

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

      CREATE TABLE IF NOT EXISTS sale (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        status INTEGER NOT NULL CHECK (status IN (0,1))
      );

      CREATE TABLE IF NOT EXISTS sale_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sale(id) ON DELETE CASCADE
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
    console.log('Venta insertada con ID', saleId);
  } catch (error) {
    console.error('Error al insertar venta:', error);
  }
};

//Obtiene la informacion de las ventas que ya se han sincronizado
export const obtenerVentas = async (): Promise<Sale[]> => {
  try {
    const ventasBase = await db.getAllAsync<any>(`SELECT * FROM sale;`);
    for (const venta of ventasBase) {
      const imagenes = await db.getAllAsync<{ url: string }>(
        `SELECT url FROM sale_images WHERE sale_id = ?;`,
        [venta.id]
      );
      venta.images = imagenes.map(img => ({ url: img.url }));
    }
    return ventasBase;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return [];
  }
};

//Elimina la Venta realizada, asi como sus datos(Esto incluye imagenes)
export const eliminarVenta = async (saleId: number): Promise<void> => {
  try {
    await db.runAsync(`DELETE FROM sale WHERE id = ?;`, [saleId]);
    console.log('Venta eliminada:', saleId);
  } catch (error) {
    console.error('Error al eliminar venta:', error);
  }
};