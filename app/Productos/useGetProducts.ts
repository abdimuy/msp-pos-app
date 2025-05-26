import { useState, useEffect } from "react";
import { initDB, insertarProductos, obtenerProductos } from "../Database/database";
import api from "../api";
import { Producto } from "../../Types/Producto";



export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const datosLocales = await obtenerProductos();
      setProductos(datosLocales);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const actualizarDatos = async () => {
    try {
      setLoading(true);
      const respuesta = await api.get("/articulos");
      const nuevosProductos = Array.isArray(respuesta.data.body) ? respuesta.data.body : [];
      await insertarProductos(nuevosProductos);
      const datosLocales = await obtenerProductos();
      setProductos(datosLocales);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al actualizar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return { productos, loading, error, actualizarDatos };
}
