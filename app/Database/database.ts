import * as SQLite from 'expo-sqlite';
import { Producto } from '../../Types/Producto';

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

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS articulos_imagenes (
        imagen_id INTEGER PRIMARY KEY,
        articulo_id INTEGER NOT NULL,
        ruta_local TEXT NOT NULL UNIQUE,
        FOREIGN KEY (articulo_id) REFERENCES productos(ARTICULO_ID)
      );
    `);

    console.log('Base de datos inicializada correctamente.');
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

export const borrarTodasLasImagenes = async (): Promise<void> => {
  try {
    const database = getDB();
    await database.runAsync(`DELETE FROM articulos_imagenes;`);
    console.log('Todas las imágenes han sido eliminadas de la base de datos.');
  } catch (error) {
    console.error('Error al borrar imágenes:', error);
  }
};
