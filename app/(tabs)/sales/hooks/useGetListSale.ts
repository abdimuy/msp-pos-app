import { useEffect, useState } from 'react';
import { getSalesLocal } from '../../../../src/services/sale/getSalesLocal/getSalesLocal';
import { Sale } from '../../../../type/Sale'; 

export function useGetListSale() {
  const [listaVentas, setListaVentas] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarListaVentas = async () => {
    setLoading(true);
    try {
      const datos = await getSalesLocal();
      setListaVentas(datos);
    } catch (e: any) {
      setError(e.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListaVentas();
  }, []);

  return { listaVentas, loading, error, recargar: cargarListaVentas };
}
