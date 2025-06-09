import * as SQLite from 'expo-sqlite';
import { Producto } from '../../type/Producto';
import { Sale } from '../../type/Sales';

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

    await almacenarEsquemasIniciales();
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

export const deleteProductsLocal = async (txn:any): Promise<void> => {
  await txn.execAsync('DELETE FROM productos;');
};


export const insertProductsLocal = async (txn: any, productos: Producto[]): Promise<void> => {
  for (const p of productos) {
    await txn.runAsync(
      `INSERT INTO productos (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO) VALUES (?, ?, ?, ?);`,
      [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, p.PRECIO]
    );
  }
};

export const getProductsLocal = async (txn: any): Promise<Producto[]> => {
  const products = await txn.getAllAsync(
    'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos;'
  );
  return products;
};


const insertSaleLocal = async (txn: any, venta: Sale): Promise<void> => {
  await txn.runAsync(
    `INSERT INTO sale (id, name, date, status) VALUES (?, ?, ?, ?);`,
    [venta.id, venta.name, venta.date, venta.status]
  );
};

const insertSaleImagenesLocal = async (txn: any, venta: Sale): Promise<void> => {
  for (const img of venta.images) {
    await txn.runAsync(
      `INSERT INTO sale_images (sale_id, url) VALUES (?, ?);`,
      [venta.id, img.url]
    );
  }
};

export const SaveCompleteLocal = async (txn: any, venta: Sale): Promise<void> => {
  const db = getDB();
    await insertSaleLocal(txn, venta);
    await insertSaleImagenesLocal(txn, venta);
  };


export const getSaleLocal = async (): Promise<Sale[]> => {
  const saleList = await db.getAllAsync<Sale>(`SELECT id, name, date, status FROM sale;`);

  for (const venta of saleList) {
    const images = await db.getAllAsync<{ url: string }>(
      `SELECT url FROM sale_images WHERE sale_id = ?;`,
      [venta.id]
    );
    venta.images = images.map((img) => ({ url: img.url }));
  }

  return saleList;
};


export const getFirtImagesByProduct = async (articulo_id: number): Promise<string | null> => {
    const database = getDB();
    const imagenPrincipal = await database.getFirstAsync<{ ruta_local: string }>(
      `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ? LIMIT 1;`,
      [articulo_id]
    );
    return imagenPrincipal ? imagenPrincipal.ruta_local : null;
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
    const rutasLocales = await database.getAllAsync<{ ruta_local: string }>(
      `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ?;`,
      [articulo_id]
    );
    return rutasLocales.map((r) => r.ruta_local);
  } catch (error) {
    console.error('Error al obtener rutas de imágenes:', error);
    return [];
  }
};

export async function obtenerProductoPorId(id: number): Promise<Producto | null> {
  try {
    const database = getDB();
    const datosDeLProducto = await database.getAllAsync<Producto>(
      'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO  FROM productos WHERE ARTICULO_ID = ?',
      [id]
    );

    if (datosDeLProducto.length > 0) {
      return datosDeLProducto[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    return null;
  }
}

export const obtenerDetallesVenta = async (id: string): Promise<Sale | null> => {
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

    detalles.images = detalles_img.map((img) => ({ url: img.url }));

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
  } catch (error) {
    console.error(error);
  }
};

// Función para obtener Tablas de la base de datos actual
// Devuelve una Promesa con un array de objetos con propiedades
export const obtenerEsquemasTablas = async (): Promise<Array<{ name: string; sql: string }>> => {
  try {
    const database = getDB();
    // Ejecuta la consulta SQL de la tabla sqlite_master y devuelve todos los resultados
    const resultados = await database.getAllAsync<{ name: string; sql: string }>(
      `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'esquemas_guardados';`
    );
    return resultados; //Resultado de la funcion con las propiedades de la promesa
  } catch (error) {
    console.error('Error al obtener los esquemas:', error);
    return [];
  }
};

// Función para crear y almacenar en esquemas_guardados
export const almacenarEsquemasIniciales = async (): Promise<void> => {
  try {
    const database = getDB();

    // Crea la tabla si no existe
    await database.runAsync(`
        CREATE TABLE IF NOT EXISTS esquemas_guardados (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre_tabla TEXT NOT NULL,
          esquema TEXT NOT NULL,
          fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

    // Obtiene los esquemas actuales
    const esquemas = await obtenerEsquemasTablas();

    for (const { name, sql } of esquemas) {
      // Verifica si ya existe ese mismo esquema registrado
      const yaExiste = await database.getFirstAsync(
        `SELECT 1 FROM esquemas_guardados WHERE nombre_tabla = ? AND esquema = ? LIMIT 1`,
        [name, sql]
      );

      // Si no existe, lo inserta
      if (!yaExiste) {
        await database.runAsync(
          `INSERT INTO esquemas_guardados (nombre_tabla, esquema) VALUES (?, ?);`,
          [name, sql]
        );
      }
    }

    await compararYModificar();
  } catch (error) {
    console.error('Error al almacenar los esquemas iniciales:', error);
  }
};

// Función para reemplazar una tabla con un nuevo esquema
const reemplazarTabla = async (nombreTabla: string, nuevoEsquema: string): Promise<void> => {
  try {
    const database = getDB();
    const nuevaTabla = `nueva_${nombreTabla}`;

    // Paso 1: Crear una nueva tabla con el nuevo esquema
    await database.runAsync(
      nuevoEsquema.replace(/CREATE TABLE \w+/i, `CREATE TABLE ${nuevaTabla}`)
    );

    // Paso 2: Copiar los datos de la tabla antigua a la nueva
    const columnas = await database.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${nombreTabla});`
    );
    const nombresColumnas = columnas.map((col) => col.name).join(', ');

    await database.runAsync(
      `INSERT INTO ${nuevaTabla} (${nombresColumnas}) SELECT ${nombresColumnas} FROM ${nombreTabla};`
    );

    // Paso 3: Eliminar la tabla antigua
    await database.runAsync(`DROP TABLE ${nombreTabla};`);

    // Paso 4: Renombrar la nueva tabla al nombre de la tabla antigua
    await database.runAsync(`ALTER TABLE ${nuevaTabla} RENAME TO ${nombreTabla};`);
  } catch (error) {
    console.error(`Error al reemplazar la tabla ${nombreTabla}:`, error);
  }
};

// Guarda solo el último esquema por tabla
const actualizarEsquemaGuardado = async (nombreTabla: string): Promise<void> => {
  try {
    const database = getDB();

    //Busca el nombre de la tabla segun el parametro
    const resultado = await database.getFirstAsync<{ sql: string }>(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name=?;`,
      [nombreTabla]
    );

    if (resultado?.sql) {
      // Elimina el registro existente
      await database.runAsync(`DELETE FROM esquemas_guardados WHERE nombre_tabla = ?;`, [
        nombreTabla,
      ]);
      //Inserta el nuevo registro
      await database.runAsync(
        `INSERT INTO esquemas_guardados (nombre_tabla, esquema) VALUES (?, ?);`,
        [nombreTabla, resultado.sql]
      );

      console.log(`Esquema actualizado para la tabla ${nombreTabla}.`);
    } else {
      console.warn(`No se encontró el esquema actual para la tabla ${nombreTabla}.`);
    }
  } catch (error) {
    console.error(`Error al actualizar el esquema de la tabla ${nombreTabla}:`, error);
  }
};

// Función para comparar esquemas y reemplazar tablas
export const compararYModificar = async (): Promise<void> => {
  try {
    const database = getDB();
    const esquemasActuales = await obtenerEsquemasTablas(); // Recupera las Tablas actuales de todas las tablas

    // Realiza un recorrido sobre cada tabal obtenida
    for (const { name, sql: esquemaActual } of esquemasActuales) {
      //Consulta la ultima version guardada en el esquema
      const esquemaAnterior = await database.getFirstAsync<{ esquema: string }>(
        `SELECT esquema FROM esquemas_guardados WHERE nombre_tabla=? ORDER BY fecha_registro DESC LIMIT 1;`,
        [name]
      );

      // Que exista un esquema diferente de NULL y diferente al anterior
      if (esquemaAnterior && esquemaAnterior.esquema !== esquemaActual) {
        console.log(`El esquema de la tabla ${name} ha cambiado.`);

        // Reemplaza la tabla con el nuevo esquema
        await reemplazarTabla(name, esquemaActual);
        // Actualiza el registro del esquema
        await actualizarEsquemaGuardado(name);

        console.log(`La tabla ${name} ha sido reemplazada debido a un cambio en su estructura.`);
      }
    }
  } catch (error) {
    console.error('Error al comparar los esquemas:', error);
  }
};
