import * as SQLite from 'expo-sqlite';
import { Producto } from '../../Types/Producto';
import { Sale, SaleAndImages, SaleImage, SaleWithSavedImages } from '../../Types/Sale';

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
    const productos = await database.getAllAsync<Producto>(
      `SELECT ARTICULO_ID, ARTICULO, EXISTENCIAS, PRECIO FROM productos;`
    );
    return productos;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Incerta ventas en base de datos
export const insertarVenta = async (venta: SaleAndImages): Promise<void> => {
  try {
    const db = getDB();
    //Guarda los datos String en la tabla sale
    await db.runAsync(
      `INSERT INTO sale (id, name, date, status, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?);`,
      [venta.id, venta.name, venta.date, venta.status, venta.latitud, venta.longitud]
    );

    // Guarda las imagenes capturadas
    for (const img of venta.images) {
      await db.runAsync(`INSERT INTO sale_images (sale_id, url) VALUES (?, ?);`, [
        venta.id,
        img.url,
      ]);
    }
  } catch (error) {
    console.error(error);
  }
};

export const obtenerVentas = async (): Promise<SaleWithSavedImages[]> => {
  try {
    const db = getDB();

    const ventasBase = await db.getAllAsync<Sale>(
      `SELECT id, name, date, status, latitud, longitud FROM sale;`
    );

    const ventasConImagenes: SaleWithSavedImages[] = [];

    for (const venta of ventasBase) {
      const imagenes = await db.getAllAsync<SaleImage>(
        `SELECT id, url FROM sale_images WHERE sale_id = ?;`,
        [venta.id]
      );

      ventasConImagenes.push({
        ...venta,
        images: imagenes,
      });
    }

    return ventasConImagenes;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return [];
  }
};

export const obtenerDetallesVenta = async (id: string): Promise<SaleWithSavedImages | null> => {
  try {
    const db = getDB();

    const detalles = await db.getFirstAsync<SaleWithSavedImages>(
      `SELECT id, name, date, status, latitud, longitud FROM sale WHERE id = ?`,
      [id]
    );

    if (!detalles) return null;

    const detalles_img = await db.getAllAsync<SaleImage>(
      `SELECT id, url FROM sale_images WHERE sale_id = ?`,
      [id]
    );

    const ventaConImagenes: SaleWithSavedImages = {
      ...detalles,
      images: detalles_img,
    };

    return ventaConImagenes;
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
    type FilaDatos = {
      [key: string]: any;
    };

    await database.runAsync(`DROP TABLE IF EXISTS ${nuevaTabla};`);
    // Paso 1: Crear la nueva tabla

    await database.runAsync(
      nuevoEsquema.replace(/CREATE TABLE \w+/i, `CREATE TABLE ${nuevaTabla}`)
    );

    // Paso 2: Obtener columnas de ambas tablas
    const columnasAntiguas = await database.getAllAsync<{ name: string; type: string }>(
      `PRAGMA table_info(${nombreTabla});`
    );

    const columnasNuevas = await database.getAllAsync<{ name: string; type: string }>(
      `PRAGMA table_info(${nuevaTabla});`
    );

    const columnasComunes = columnasNuevas.filter((colNueva) =>
      columnasAntiguas.some((colAntigua) => colAntigua.name === colNueva.name)
    );

    const datos = await database.getAllAsync<FilaDatos>(
      `SELECT ${columnasComunes.map((col) => col.name).join(', ')} FROM ${nombreTabla};`
    );

    // Paso 3: Insertar los datos
    await database.runAsync('BEGIN TRANSACTION;');
    try {
      for (const fila of datos) {
        const columnas = columnasComunes.map((col) => col.name).join(', ');
        const placeholders = columnasComunes.map(() => '?').join(', ');
        const valores = columnasComunes.map((col) =>
          col.name === 'id' ? String(fila[col.name]) : fila[col.name]
        );

        await database.runAsync(
          `INSERT INTO ${nuevaTabla} (${columnas}) VALUES (${placeholders})`,
          valores
        );
      }
      await database.runAsync('COMMIT;');
    } catch (err) {
      await database.runAsync('ROLLBACK;');
      throw err;
    }

    // Paso 4: Reemplazo final
    await database.runAsync(`DROP TABLE ${nombreTabla};`);
    await database.runAsync(`ALTER TABLE ${nuevaTabla} RENAME TO ${nombreTabla};`);

    console.log(`✅ La tabla ${nombreTabla} ha sido reemplazada con éxito.`);
  } catch (error) {
    console.error(`❌ Error al reemplazar la tabla ${nombreTabla}:`, error);
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
