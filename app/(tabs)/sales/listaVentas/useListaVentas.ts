import { useEffect, useState } from 'react';
import { obtenerVentas } from 'app/Database/database';
import { Sale } from '../../../../Types/sales'; // Ajusta si tu ruta es diferente

export function useListaVentas() {
  const [listaVentas, setListaVentas] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarListaVentas = async () => {
    setLoading(true);
    try {
      const datos = await obtenerVentas();
      setListaVentas(datos);
    }catch (e:any){
      setError(e.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListaVentas();
  }, []);

  return { listaVentas, loading,error, recargar: cargarListaVentas };
}
