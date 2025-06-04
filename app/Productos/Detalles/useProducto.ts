import { useEffect, useState } from 'react';
import { Producto } from '../../../Types/Producto';
import { obtenerProductoPorId } from '../../Database/database';

export function useProducto(id: number) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerProductoPorId(id)
      .then((res) => {
        setProducto(res);
        setError(null);
      })
      .catch(() => setError('Error al obtener el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  return { producto, loading, error };
}
