import * as SQLite from 'expo-sqlite';
import { Producto } from '../../type/Producto';
import { Sale } from '../../type/Sales';

let db: SQLite.SQLiteDatabase;

export type Tx = Parameters<typeof db.withExclusiveTransactionAsync>[0] extends (tx: infer T) => any
  ? T : never;

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

export const deleteProductsLocal = async (txn: Tx): Promise<void> => {
  await txn.runAsync('DELETE FROM productos;');
};


export const insertProductsLocal = async (productos: Producto[], txn:Tx): Promise<void> => {
  for (const p of productos) {
    await txn.runAsync(
      `INSERT INTO productos (ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO) VALUES (?, ?, ?, ?);`,
      [p.ARTICULO_ID, p.ARTICULO, p.EXISTENCIAS, p.PRECIO]
    );
  }
};

export const getProductsLocal = async (txn?: Tx): Promise<Producto[]> => {
  const database = txn ?? db;
  const products = await database.getAllAsync<Producto>(
    'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos;'
  );
  return products;
};


const insertSaleLocal = async (venta: Sale, txn: Tx): Promise<void> => {
  await txn.runAsync(
    `INSERT INTO sale (id, name, date, status) VALUES (?, ?, ?, ?);`,
    [venta.id, venta.name, venta.date, venta.status]
  );
};

const insertSaleImagenesLocal = async (venta: Sale, txn: Tx): Promise<void> => {
  for (const img of venta.images) {
    await txn.runAsync(
      `INSERT INTO sale_images (sale_id, url) VALUES (?, ?);`,
      [venta.id, img.url]
    );
  }
};

export const SaveCompleteLocal = async (venta: Sale, txn: Tx): Promise<void> => {
    await insertSaleLocal(venta, txn);
    await insertSaleImagenesLocal(venta, txn);
  };
 

export const getSaleLocal = async (txn?: Tx): Promise<Sale[]> => {
  const database = txn ?? db;
  const saleList = await database.getAllAsync<Sale>(`SELECT id, name, date, status FROM sale;`);

  for (const venta of saleList) {
    const images = await database.getAllAsync<{ url: string }>(
      `SELECT url FROM sale_images WHERE sale_id = ?;`,
      [venta.id]
    );
    venta.images = images.map((img) => ({ url: img.url }));
  }

  return saleList;
};


export const getFirtImagesByProductLocal = async (articulo_id: number, txn?: Tx): Promise<string | null> => {
    const database = txn ?? db;
    const mainImage = await database.getFirstAsync<{ ruta_local: string }>(
      `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ? LIMIT 1;`,
      [articulo_id]
    );
    return mainImage ? mainImage.ruta_local : null;
};


type ImageWithId = {
  image_id: number;
  local_path: string;
};

//Inserta en la tabla imagenes las rutas locales de las imágenes asociadas a un producto
export const insertImagePathsIfNotExistLocal = async (articulo_id: number, imagenes: ImageWithId[], txn: Tx): Promise<void> => {  
    let newImagesCount  = 0;

    for (const { image_id, local_path } of imagenes) {
      const existingImage  = await txn.getFirstAsync<{ imagen_id: number }>(
        `SELECT imagen_id FROM articulos_imagenes WHERE imagen_id = ?;`,
        [image_id]
      );

      if (!existingImage ) {
        await txn.runAsync(
          `INSERT INTO articulos_imagenes (imagen_id, articulo_id, ruta_local) VALUES (?, ?, ?);`,
          [image_id, articulo_id, local_path]
        );
        newImagesCount ++;
      }
    }
    console.log(`Se insertaron ${newImagesCount } imágenes nuevas para el producto ${articulo_id}`);
}

//Consulta en la tabla y devuelve un array con las rutas locales
export const getImagePathsByProductLocal = async (articulo_id: number, tnx?: Tx): Promise<string[]> => {
    const database = tnx?? db;
    const rutasLocales = await database.getAllAsync<{ ruta_local: string }>(
      `SELECT ruta_local FROM articulos_imagenes WHERE articulo_id = ?;`,
      [articulo_id]
    );
    return rutasLocales.map((r) => r.ruta_local);
  };

export async function getProductByIdLocal(id: number, txn?: Tx): Promise<Producto | null> {
  const database = txn ?? db;
  const productData = await database.getAllAsync<Producto>(
    'SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos WHERE ARTICULO_ID = ?',
    [id]
  );

  return productData.length > 0 ? productData[0] : null;
}


export const getSaleDetailsLocal = async (id: number, txn?: Tx): Promise<Sale | null> => {
  const database = txn ?? db;

  const details = await database.getFirstAsync<Sale>(
    `SELECT id, name, date, status FROM sale WHERE id = ?`,
    [id]
  );

  if (!details) return null;

  const details_img = await database.getAllAsync<{ url: string }>(
    `SELECT url FROM sale_images WHERE sale_id = ?`,
    [id]
  );

  details.images = details_img.map((img) => ({ url: img.url }));

  return details;
};


//Elimina la Venta realizada, asi como sus datos(Esto incluye imagenes)
export const deleteAllSalesLocal = async (tnx:Tx): Promise<void> => {
    await tnx.runAsync(`DELETE FROM sale;`);
    await tnx.runAsync(`DELETE FROM sale_images;`);
  }


// Función para obtener Tablas de la base de datos actual
// Devuelve una Promesa con un array de objetos con propiedades
export const getTableSchemasLocal = async (txn?: Tx): Promise<Array<{ name: string; sql: string }>> => {
  const database = txn ?? db;

  return await database.getAllAsync<{ name: string; sql: string }>(
    `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'esquemas_guardados';`
  );
};


// Función para crear y almacenar en esquemas_guardados
export const storeInitialSchemasLocal = async (txn?: Tx): Promise<void> => {
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

  // Solo llamar compareAndModify si se proporciona una transacción
  if (txn) {
    await compareAndModifyLocal(txn);
  }
};



   

// Función para reemplazar una tabla con un nuevo esquema
export const replaceTableLocal = async (tableName: string, newSchema: string, txn: Tx): Promise<void> => {

  // Paso 1: Crear una nueva tabla con el nuevo esquema
  await txn.runAsync(
    newSchema.replace(/CREATE TABLE \w+/i, `CREATE TABLE nueva_${tableName}`)
  );

  // Paso 2: Copiar los datos de la tabla antigua a la nueva
  const columnas = await txn.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${tableName});`
  );
  const columnNames = columnas.map((col) => col.name).join(', ');

  await txn.runAsync(
    `INSERT INTO nueva_${tableName} (${columnNames}) SELECT ${columnNames} FROM ${tableName};`
  );

  // Paso 3: Eliminar la tabla antigua
  await txn.runAsync(`DROP TABLE ${tableName};`);

  // Paso 4: Renombrar la nueva tabla al nombre de la tabla antigua
  await txn.runAsync(`ALTER TABLE nueva_${tableName} RENAME TO ${tableName};`);
};


// Guarda solo el último esquema por tabla
export const updateSavedSchemaLocal = async (tableName: string, txn: Tx): Promise<void> => {

  // Busca el nombre de la tabla según el parámetro
  const schemaData = await txn.getFirstAsync<{ sql: string }>(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name=?;`,
    [tableName]
  );

  if (!schemaData?.sql) {
    console.warn(`No se encontró el esquema actual para la tabla ${tableName}.`);
    return;
  }

  // Elimina el registro existente
  await txn.runAsync(`DELETE FROM esquemas_guardados WHERE nombre_tabla = ?;`, [
    tableName,
  ]);

  // Inserta el nuevo registro
  await txn.runAsync(
    `INSERT INTO esquemas_guardados (nombre_tabla, esquema) VALUES (?, ?);`,
    [tableName, schemaData.sql]
  );
};


// Función para comparar esquemas y reemplazar tablas
export const compareAndModifyLocal = async (txn: Tx): Promise<void> => {
  
  const esquemasActuales = await getTableSchemasLocal(txn); // Recupera las tablas actuales de todas las tablas

  // Recorre cada tabla obtenida
  for (const { name, sql: esquemaActual } of esquemasActuales) {
    // Consulta la última versión guardada del esquema
    const esquemaAnterior = await txn.getFirstAsync<{ esquema: string }>(
      `SELECT esquema FROM esquemas_guardados WHERE nombre_tabla=? ORDER BY fecha_registro DESC LIMIT 1;`,
      [name]
    );

    // Verifica que exista un esquema previo y que sea diferente al actual
    if (esquemaAnterior && esquemaAnterior.esquema !== esquemaActual) {
      console.log(`El esquema de la tabla ${name} ha cambiado.`);

      // Reemplaza la tabla con el nuevo esquema
      await replaceTableLocal(name, esquemaActual, txn);
      // Actualiza el registro del esquema
      await updateSavedSchemaLocal(name, txn);

      console.log(`La tabla ${name} ha sido reemplazada debido a un cambio en su estructura.`);
    }
  }
};
