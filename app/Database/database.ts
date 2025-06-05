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

export const getDB = (): SQLite.SQLiteDatabase => {
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

export const obtenerImagenPrincipalPorArticulo = async (
  articulo_id: number
): Promise<string | null> => {
  try {
    const database = getDB();
    const resultado = await database.getFirstAsync<{ ruta_local: string }>(
      `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ? LIMIT 1;`,
      [articulo_id]
    );
    return resultado ? resultado.ruta_local : null;
  } catch (error) {
    console.error('Error al obtener imagen principal:', error);
    return null;
  }
};

type ImagenConId = {
  imagen_id: number;
  ruta_local: string;
};

//Inserta en la tabla imagenes las rutas locales de las imágenes asociadas a un producto
export const insertarRutasImagenesSiNoExisten = async (
  articulo_id: number,
  imagenes: ImagenConId[]
): Promise<void> => {
  try {
    const database = getDB();

    let nuevas = 0;

    for (const { imagen_id, ruta_local } of imagenes) {
      const existente = await database.getFirstAsync<{ imagen_id: number }>(
        `SELECT imagen_id FROM articulos_imagenes WHERE imagen_id = ?;`,
        [imagen_id]
      );

      if (!existente) {
        await database.runAsync(
          `INSERT INTO articulos_imagenes (imagen_id, articulo_id, ruta_local) VALUES (?, ?, ?);`,
          [imagen_id, articulo_id, ruta_local]
        );
        nuevas++;
      }
    }

    console.log(`Se insertaron ${nuevas} imágenes nuevas para el producto ${articulo_id}`);
  } catch (error) {
    console.error('Error al insertar rutas de imágenes:', error);
  }
};

//Consulta en la tabla y devuelve un array con las rutas locales
export const obtenerRutasImagenesPorArticulo = async (articulo_id: number): Promise<string[]> => {
  try {
    const database = getDB();
    const resultados = await database.getAllAsync<{ ruta_local: string }>(
      `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ?;`,
      [articulo_id]
    );
    return resultados.map((r) => r.ruta_local);
  } catch (error) {
    console.error('Error al obtener rutas de imágenes:', error);
    return [];
  }
};

export async function obtenerProductoPorId(id: number): Promise<Producto | null> {
  try {
    const database = getDB();
    const result = await database.getAllAsync<Producto>(
      'SELECT ARTICULO, PRECIO FROM productos WHERE ARTICULO_ID = ?',
      [id]
    );

    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    return null;
  }
}

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

