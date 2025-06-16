import { Text, View, Alert } from 'react-native';
import { useGetProducts } from './products/useGetProducts';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Boton } from '../components/boton/Boton';
import { getImageApi } from '../src/services/getImageApi';
import {
  contarImagenesNuevas,
  sincronizarImagenesNuevasPorProducto,
} from '../src/services/synchronizeImages';

export default function Home() {
  const { actualizarDatosProductos, error } = useGetProducts();
  const [loadingActualizar, setLoadingActualizar] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const confirmarDescarga = (cantidad: number): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Sincronizar imágenes',
        `Hay ${cantidad} imágenes nuevas. Descargar las imágenes puede consumir tus datos móviles. ¿Deseas continuar?`,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Descargar', onPress: () => resolve(true) },
        ],
        { cancelable: false }
      );
    });
  };

  const manejarActualizacion = async () => {
    try {
      setLoadingActualizar(true);

      // Llama a la función que actualiza productos
      await actualizarDatosProductos();

      // Obtiene la lista de imágenes desde la API
      const listaImagenesProductos = await getImageApi();
      if (!listaImagenesProductos || !Array.isArray(listaImagenesProductos)) return;

      const { totalImagenesNuevas, imagenesNuevasPorProducto } =
        await contarImagenesNuevas(listaImagenesProductos);

      // Confirmar descarga si hay muchas imágenes
      if (totalImagenesNuevas > 20) {
        const confirmado = await confirmarDescarga(totalImagenesNuevas);
        if (!confirmado) return;
      } else {
        console.log(`Descargando automáticamente ${totalImagenesNuevas} imágenes...`);
      }

      await sincronizarImagenesNuevasPorProducto(imagenesNuevasPorProducto);

      Alert.alert('Éxito', 'Datos actualizados correctamente.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema durante la actualización.');
    } finally {
      setLoadingActualizar(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Pantalla de inicio</Text>

      <Link href="/(tabs)/sales/newSale/NewSales" asChild>
        <Boton label="Nueva venta" onPress={() => {}} />
      </Link>

      <Link href="/(tabs)/sales/saleList/ListSale" asChild>
        <Boton label="Lista de ventas" onPress={() => {}} />
      </Link>

      <Link href="/products/ProductsList" asChild>
        <Boton label="Ver Productos" onPress={() => {}} />
      </Link>

      <Boton
        label="Actualizar Datos"
        onPress={manejarActualizacion}
        loading={loadingActualizar}
        disabled={loadingActualizar}
      />
    </View>
  );
}
