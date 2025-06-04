import { Text, View, Alert } from 'react-native';
import { useProductos } from './Productos/useGetProducts';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Boton } from '../Componentes/Boton/boton';
import { fetchImagenes } from '../src/services/getImage'; 
import { contarImagenesNuevas, sincronizarImagenesDesdeInfo } from '../src/services/SincronizarImagenes';

export default function Home() {
  const { actualizarDatos, error } = useProductos();
  const [loadingActualizar, setLoadingActualizar] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);
 
  const confirmarDescarga = (cantidad: number): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Sincronizar imágenes',
        `Hay ${cantidad} imágenes nuevas. ¿Deseas descargarlas?`,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Descargar', onPress: () => resolve(true) }
        ],
        { cancelable: false }
      );
    });
  };
 
  const manejarActualizacion = async () => {
  try {
    setLoadingActualizar(true);

    //Llama a la funcion.
    await actualizarDatos();
    //Descarga info de imágenes con fetchImagenes y valida si es un array 
    const data = await fetchImagenes();
    if (!data || !Array.isArray(data)) return;

    const { totalNuevas, nuevasPorProducto } = await contarImagenesNuevas(data);


    if (totalNuevas > 20) {
      const confirmado = await confirmarDescarga(totalNuevas);
      if (!confirmado) return;
    } else {
      console.log(`Descargando automáticamente ${totalNuevas} imágenes...`);
    } 
    Alert.alert('Éxito', 'Datos actualizados.');

    await sincronizarImagenesDesdeInfo(nuevasPorProducto);

  } catch (error) {
    Alert.alert('Error', 'Hubo un problema durante la actualización.');
  } finally {
    setLoadingActualizar(false);
  }
};

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Pantalla de inicio</Text>

      <Link href="/(tabs)/sales/nuevaVenta/newSales" asChild>
        <Boton label="Nueva venta" onPress={() => {}} />
      </Link>


      <Link href="/Productos/ListaProductos" asChild>
        
      <Link href="/(tabs)/sales/listaVentas/listSale" asChild>
        <Boton label="Lista de ventas" onPress={() => {}} />
      </Link>

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
