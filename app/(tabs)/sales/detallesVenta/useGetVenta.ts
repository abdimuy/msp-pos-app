import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getSaleDetails } from 'app/database/database';
import { Sale } from '../../../../type/Sales';

export function useGetVenta() {
  const { id } = useLocalSearchParams();
  const [venta, setVenta] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarVenta = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getSaleDetails (Number(id));
        setVenta(data);
      } catch (e: any) {
        setError(e.message || 'Error al cargar los detalles de la venta');
      } finally {
        setLoading(false);
      }
    };

    cargarVenta();
  }, [id]);

  return { venta, loading, error };
}
