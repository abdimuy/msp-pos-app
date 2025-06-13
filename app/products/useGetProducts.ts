import { useState, useEffect } from 'react';
import { getProductsLocal } from '../../src/services/products/getProductsLocal/getProductsLocal';
import { insertProductsLocal } from '../../src/services/products/insertProductsLocal/insertProductsLocal';
import { getFirstImageByProductLocal } from '../../src/services/products/getFirstImageByProductLocal/getFirstImageByProductLocal';
import { deleteProductsLocal } from '../../src/services/products/deleteProductsLocal/deleteProductsLocal'; // <-- Asegúrate de importar esto
import api from '../api';
import { ProductoConImagen } from '../../type/Products';

export function useGetProducts() {
  const [productos, setProductos] = useState<ProductoConImagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProductosConImagenes = async () => {
    try {
      setLoading(true);

      const productosLocales = await getProductsLocal();

      const productosConImagen = await Promise.all(
        productosLocales.map(async (p) => {
          const ruta = await getFirstImageByProductLocal(p.ARTICULO_ID);
          return { ...p, IMAGEN_RUTA: ruta };
        })
      );

      setProductos(productosConImagen);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const actualizarDatosProductos = async () => {
    try {
      setLoading(true);

      // 1. Obtener productos desde API
      const articulosDeApi = await api.get('/articulos');
      const nuevosProductos = Array.isArray(articulosDeApi.data.body)
        ? articulosDeApi.data.body
        : [];

      // 2. Borrar productos locales para evitar duplicados
      await deleteProductsLocal();

      // 3. Insertar productos nuevos
      await insertProductsLocal(nuevosProductos);

      // 4. Recargar productos con imágenes
      await cargarProductosConImagenes();

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductosConImagenes();
  }, []);

  return { productos, loading, error, actualizarDatosProductos };
}
