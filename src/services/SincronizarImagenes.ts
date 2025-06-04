import { fetchImagenes, Imagenes } from '../services/getImage';
import * as FileSystem from 'expo-file-system';
import { getDB, insertarRutasImagenesSiNoExisten } from '../../app/Database/database';
import { Alert } from 'react-native';

// Lee todos lo imagenes_id que esten en mi base de datos
const obtenerImagenesExistentes = async (): Promise<Set<number>> => {
  const database = getDB();
  const filas = await database.getAllAsync<{ imagen_id: number }>(
    `SELECT imagen_id FROM imagenes;`,
    []
  );
  return new Set(filas.map((f) => f.imagen_id));
};

//Toma como entrada un array de productso con urls y extrae la url
export const contarImagenesNuevas = async (
  data: Imagenes[]
): Promise<{
  totalNuevas: number;
  nuevasPorProducto: Record<number, { id: number; url: string }[]>;
}> => {
  //Obtienelas que ya estan guardada
  const existentes = await obtenerImagenesExistentes();

  let totalNuevas = 0;
  const nuevasPorProducto: Record<number, { id: number; url: string }[]> = {};

  for (const articulo of data) {
    for (const urlCompleta of articulo.urls) {
      const partesUrl = urlCompleta.split('/');
      const imagen_id = parseInt(partesUrl[partesUrl.length - 1], 10);

      if (isNaN(imagen_id)) {
        console.warn(`URL inválida, no se pudo extraer imagen_id: ${urlCompleta}`);
        continue;
      }

      //Si la imagen aún no existe en la base de datos, se considera nueva y se guarda en el resultado
      if (!existentes.has(imagen_id)) {
        totalNuevas++;
        if (!nuevasPorProducto[articulo.id]) nuevasPorProducto[articulo.id] = [];
        nuevasPorProducto[articulo.id].push({ id: imagen_id, url: urlCompleta });
      }
    }
  }

  return { totalNuevas, nuevasPorProducto };
};

//Descarga una imagen desde una URL y la guarda en el almacenamiento local del dispositivo
const descargarYGuardarImagen = async (
  url: string,
  nombreArchivo: string
): Promise<{ ruta: string; tamano: number }> => {
  const directorio = `${FileSystem.documentDirectory}imagenes`;
  await FileSystem.makeDirectoryAsync(directorio, { intermediates: true });

  const rutaLocal = `${directorio}/${nombreArchivo}.jpg`;
  const fileInfo = await FileSystem.getInfoAsync(rutaLocal);

  if (fileInfo.exists) {
    const tamano = 'size' in fileInfo ? (fileInfo.size ?? 0) : 0;
    return { ruta: rutaLocal, tamano };
  }

  try {
    const descarga = await FileSystem.downloadAsync(url, rutaLocal);
    const nuevaInfo = await FileSystem.getInfoAsync(descarga.uri);
    const tamano = nuevaInfo.exists && 'size' in nuevaInfo ? (nuevaInfo.size ?? 0) : 0;
    return { ruta: descarga.uri, tamano };
  } catch (error) {
    console.error('Error descargando imagen:', error);
    return { ruta: '', tamano: 0 };
  }
};

//Permite ejecutar la descargar de manera progresiva sin saturar
const limitarConcurrencia = <T>(
  items: T[],
  maxConcurrent: number,
  fn: (item: T) => Promise<void>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let enEjecucion = 0;
    let index = 0;

    const siguiente = () => {
      if (index === items.length && enEjecucion === 0) {
        resolve();
        return;
      }

      while (enEjecucion < maxConcurrent && index < items.length) {
        const item = items[index++];
        enEjecucion++;
        fn(item)
          .catch(reject)
          .finally(() => {
            enEjecucion--;
            siguiente();
          });
      }
    };

    siguiente();
  });
};

// Sincroniza las nuevas imágenes agrupadas por producto.
export const sincronizarImagenesDesdeInfo = async (
  nuevasPorProducto: Record<number, { id: number; url: string }[]>
): Promise<void> => {
  try {
    let pesoTotalBytes = 0;

    for (const articuloIdStr in nuevasPorProducto) {
      const articuloId = Number(articuloIdStr);
      const imagenesNuevas = nuevasPorProducto[articuloId];
      if (!imagenesNuevas) continue;

      const rutasLocales: { imagen_id: number; ruta_local: string }[] = [];

      await limitarConcurrencia(imagenesNuevas, 5, async (img) => {
        const urlCorregida = img.url.replace('localhost', '192.168.0.219'); //Reemplaza localhost por una IP real para que funcione en un dispositivo físico.
        const resultado = await descargarYGuardarImagen(urlCorregida, `${articuloId}_${img.id}`);
        if (resultado.ruta) {
          rutasLocales.push({ imagen_id: img.id, ruta_local: resultado.ruta });
          pesoTotalBytes += resultado.tamano;
        }
      });

      //Inserta las rutas en la base de datos, evitando duplicados
      if (rutasLocales.length > 0) {
        await insertarRutasImagenesSiNoExisten(articuloId, rutasLocales);
        console.log(
          `Producto ${articuloId}: ${rutasLocales.length} nuevas imágenes sincronizadas.`
        );
      }
    }

    const pesoTotalMB = (pesoTotalBytes / (1024 * 1024)).toFixed(2);
    console.log(`Descarga finalizada. Se descargaron de imágenes (${pesoTotalMB} MB).`);
  } catch (error) {
    console.error('ERROR al sincronizar imágenes:', error);
    Alert.alert(
      'Error de Sincronización',
      'Ocurrió un error inesperado al sincronizar las imágenes.'
    );
  }
};
