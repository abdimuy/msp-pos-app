import { Imagenes } from './getImageApi';
import * as FileSystem from 'expo-file-system';
import { getDB } from '../../app/database/database';
import { insertImagePathsIfNotExistLocal } from './products/insertImagePathsIfNotExistLocal/insertImagePathsIfNotExistLocal';
import { Alert } from 'react-native';

// Lee todos lo imagenes_id que esten en mi base de datos
const obtenerImagenesExistentes = async (): Promise<Set<number>> => {
  const database = getDB();
  const filas = await database.getAllAsync<{ imagen_id: number }>(
    `SELECT imagen_id FROM articulos_imagenes;`,
    []
  );
  return new Set(filas.map((f) => f.imagen_id));
};

// Toma como entrada un array de productos con URLs y extrae la URL
export const contarImagenesNuevas = async (
  data: Imagenes[]
): Promise<{
  totalImagenesNuevas: number;
  imagenesNuevasPorProducto: Record<number, { id: number; url: string }[]>;
}> => {
  const existentes = await obtenerImagenesExistentes();

  let totalImagenesNuevas = 0;
  const imagenesNuevasPorProducto: Record<number, { id: number; url: string }[]> = {};

  for (const articulo of data) {
    for (const urlCompleta of articulo.urls) {
      const partesUrl = urlCompleta.split('/');
      const imagen_id = parseInt(partesUrl[partesUrl.length - 1], 10);

      if (isNaN(imagen_id)) {
        console.warn(`URL inválida, no se pudo extraer imagen_id: ${urlCompleta}`);
        continue;
      }

      if (!existentes.has(imagen_id)) {
        totalImagenesNuevas++;
        if (!imagenesNuevasPorProducto[articulo.id]) imagenesNuevasPorProducto[articulo.id] = [];
        imagenesNuevasPorProducto[articulo.id].push({ id: imagen_id, url: urlCompleta });
      }
    }
  }

  return { totalImagenesNuevas, imagenesNuevasPorProducto };
};

//Devuelve la ruta completa donde se debería guardar una imagen
const rutaImagenLocal = (nombreArchivo: string) =>
  `${FileSystem.documentDirectory}imagenes/${nombreArchivo}.jpg`;

const existeImagen = async (ruta: string): Promise<{ ruta: string; tamano: number } | null> => {
  const info = await FileSystem.getInfoAsync(ruta);
  if (info.exists) {
    const tamano = 'size' in info ? (info.size ?? 0) : 0;
    return { ruta, tamano };
  }
  return null;
};

const guardarImagen = async (
  url: string,
  ruta: string
): Promise<{ ruta: string; tamano: number }> => {
  try {
    const descarga = await FileSystem.downloadAsync(url, ruta);
    const info = await FileSystem.getInfoAsync(descarga.uri);
    const tamano = info.exists && 'size' in info ? (info.size ?? 0) : 0;
    return { ruta: descarga.uri, tamano };
  } catch (e) {
    console.error('Error al guardar imagen:', e);
    return { ruta: '', tamano: 0 };
  }
};

const guardarImagenSiNoExiste = async (
  url: string,
  nombreArchivo: string
): Promise<{ ruta: string; tamano: number }> => {
  const dir = `${FileSystem.documentDirectory}imagenes`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

  const ruta = rutaImagenLocal(nombreArchivo);
  return (await existeImagen(ruta)) ?? (await guardarImagen(url, ruta));
};

// Sincroniza las nuevas imágenes agrupadas por producto.
export const sincronizarImagenesNuevasPorProducto = async (
  imagenesNuevasPorProducto: Record<number, { id: number; url: string }[]>
): Promise<void> => {
  try {
    let pesoTotalBytes = 0;

    for (const articuloIdStr in imagenesNuevasPorProducto) {
      const articuloId = Number(articuloIdStr);
      const imagenesNuevas = imagenesNuevasPorProducto[articuloId];
      if (!imagenesNuevas) continue;

      const rutasLocales: { image_id: number; local_path: string }[] = [];

      //Ejecuta en paralelo de todas las descargas de imágenes de ese producto usando Promise.all
      const imagenesGuardadas = await Promise.all(
        imagenesNuevas.map(async (img) => {
          const urlCorregida = img.url.replace('localhost', '192.168.0.214');
          const imagenGuardada = await guardarImagenSiNoExiste(
            urlCorregida,
            `${articuloId}_${img.id}`
          );
          return { ...imagenGuardada, id: img.id };
        })
      );

      for (const res of imagenesGuardadas) {
        if (res.ruta) {
          rutasLocales.push({ image_id: res.id, local_path: res.ruta });
          pesoTotalBytes += res.tamano;
        }
      }

      if (rutasLocales.length > 0) {
        await insertImagePathsIfNotExistLocal(articuloId, rutasLocales);
        console.log(
          `Producto ${articuloId}: ${rutasLocales.length} nuevas imágenes sincronizadas.`
        );
      }
    }

    const pesoTotalMB = (pesoTotalBytes / (1024 * 1024)).toFixed(2);
    console.log(`Descarga finalizada. Se descargaron imágenes (${pesoTotalMB} MB).`);
  } catch (error) {
    console.error('ERROR al sincronizar imágenes:', error);
    Alert.alert(
      'Error de Sincronización',
      'Ocurrió un error inesperado al sincronizar las imágenes.'
    );
  }
};
