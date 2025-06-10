import { useState, useEffect } from 'react';
import { getProductsLocal } from '../../src/services/products/getProductsLocal/getProductsLocal';
import { insertProductsLocal } from '../../src/services/products/insertProductsLocal/insertProductsLocal';
import { getFirtImagesByProductLocal } from '../../src/services/products/getFirtImagesByProductLocal/getFirtImagesByProductLocal'
import api from '../api';
import { ProductoConImagen } from '../../type/Producto';

export function useGetProductos() {
  const [productos, setProductos] = useState<ProductoConImagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProductosConImagenes = async () => {
    try {
      setLoading(true);

      // Obtiene productos desde la base local
      const productosLocales = await getProductsLocal();

      // Para cada producto, obtiene la imagen principal y la agrega al objeto producto
      const productosConImagen = await Promise.all(
        productosLocales.map(async (p) => {
          const ruta = await getFirtImagesByProductLocal(p.ARTICULO_ID);
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
      // Obtener productos desde API
      const articulosDeApi = await api.get('/articulos');
      const nuevosProductos = Array.isArray(articulosDeApi.data.body)
        ? articulosDeApi.data.body
        : [];

      // Guardar productos en la base local
      await insertProductsLocal(nuevosProductos);

      // Luego recargar productos con imágenes desde la BD local
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
