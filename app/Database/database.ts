import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

const db: SQLiteDatabase = openDatabaseSync('productos.db');

export const initDB = (): void => {
  try {
    db.runSync(
      `CREATE TABLE IF NOT EXISTS productos (
        ARTICULO_ID INTEGER PRIMARY KEY NOT NULL,
        ARTICULO TEXT NOT NULL,
        EXISTENCIAS INTEGER NOT NULL,
        PRECIO REAL NOT NULL
      );`
    );
    console.log('Base de datos inicializada.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    console.error("ERROR CRÍTICO: Fallo al inicializar la DB");
  }
};


export const insertarProductos = (productos: any[]): void => {
  try {
    let insertados = 0;
    productos.forEach(p => {
      db.runSync(
        `INSERT OR REPLACE INTO productos 
         (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO) 
         VALUES (?, ?, ?, ?);`,
        [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, p.PRECIO]
      );
      insertados++;
    });
    console.log(`${insertados} productos insertados o actualizados.`);
  } catch (error) {
    console.error('Error al insertar o actualizar productos:', error);
  }
};

export const obtenerProductos = (): any[] => {
  try {
    const resultados = db.getAllSync('SELECT * FROM productos;');
    console.log(`Recuperados ${resultados.length} productos.`);
    return resultados;
  } catch (error) {
    console.error('Error al obtener productos con getAllSync:', error);
    return []; 
  }
};
