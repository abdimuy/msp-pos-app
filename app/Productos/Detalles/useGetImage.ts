import { useState, useEffect } from 'react';
import { obtenerRutasImagenesPorArticulo } from '../../Database/database';

export function useGetImage(id: number) {
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function cargarImagenes() {
      setLoading(true);
      setError(null);

      try {
        //Llama la funcion que obtiene las rutas locales desde SQLite
        const rutasLocales = await obtenerRutasImagenesPorArticulo(id);
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
    }

    cargarImagenes();
  }, [id]);

  return { imagenes, loading, error };
}
