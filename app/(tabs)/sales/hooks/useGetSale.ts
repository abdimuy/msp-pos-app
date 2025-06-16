import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getSaleDetailsLocal } from '../../../../src/services/sale/getSaleDetailsLocal/getSaleDetailsLocal';
import { SaleWithSavedImages } from '../../../../type/Sale';

export function useGetSale() {
  const { id } = useLocalSearchParams();
  const [venta, setVenta] = useState<SaleWithSavedImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarVenta = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getSaleDetailsLocal(String(id));
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
