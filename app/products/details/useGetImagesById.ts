import { useState, useEffect, useCallback } from 'react';
import { getImagePathsByProductLocal } from '../../../src/services/products/getImagePathsByProductLocal/getImagePathsByProductLocal';

export function useGetImagesById(id: number) {
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerImagenActualizada = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const rutasLocales = await getImagePathsByProductLocal(id);
      if (rutasLocales.length > 0) {
        setImagenes(rutasLocales);
      } else {
        setError('No se encontraron imágenes para este producto');
        setImagenes([]);
      }
    } catch (e: any) {
      setError(e.message || 'Error al cargar imágenes');
      setImagenes([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    obtenerImagenActualizada();
  }, [obtenerImagenActualizada]);

  return { imagenes, loading, error, actualizarImagenes: obtenerImagenActualizada };
}
