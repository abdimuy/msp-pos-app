import { Text, View, Alert } from 'react-native';
import { useGetProductos } from './Productos/useGetProductos';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Boton } from '../Componentes/Boton/boton';
import { getImage } from '../src/services/getImage';
import {
  contarImagenesNuevas,
  sincronizarImagenesNuevasPorProducto,
} from '../src/services/SincronizarImagenes';

export default function Home() {
  const { actualizarDatosProductos, error } = useGetProductos();
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

      //Llama a la funcion.
      await actualizarDatosProductos();
      //Obtiene el array de las url y las guarda
      const listaImagenesProductos = await getImage();
      if (!listaImagenesProductos || !Array.isArray(listaImagenesProductos)) return;

      const { totalImagenesNuevas, imagenesNuevasPorProducto } =
        await contarImagenesNuevas(listaImagenesProductos);

      if (totalImagenesNuevas > 20) {
        const confirmado = await confirmarDescarga(totalImagenesNuevas);
        if (!confirmado) return;
      } else {
        console.log(`Descargando automáticamente ${totalImagenesNuevas} imágenes...`);
      }

      await sincronizarImagenesNuevasPorProducto(imagenesNuevasPorProducto);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema durante la actualización.');
    } finally {
      setLoadingActualizar(false);
    }
    Alert.alert('Éxito', 'Datos actualizados.');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Pantalla de inicio</Text>

      <Link href="/(tabs)/sales/nuevaVenta/newSales" asChild>
        <Boton label="Nueva venta" onPress={() => {}} />
      </Link>

      <Link href="/(tabs)/sales/listaVentas/listSale" asChild>
        <Boton label="Lista de ventas" onPress={() => {}} />
      </Link>

      <Link href="/Productos/ListaProductos" asChild>
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
