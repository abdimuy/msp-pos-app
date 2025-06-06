import { useEffect, useState, useCallback } from 'react';
import { Producto } from '../../../Types/Producto';
import { obtenerProductoPorId } from '../../Database/database';

export function useGetProductById(id: number) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerProductoActualizado = useCallback(() => {
    setLoading(true);
    obtenerProductoPorId(id)
      .then((res) => {
        setProducto(res);
        setError(null);
      })
      .catch(() => setError('Error al obtener el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    obtenerProductoActualizado();
  }, [obtenerProductoActualizado]);

  return { producto, loading, error, actualizarProducto: obtenerProductoActualizado };
}
