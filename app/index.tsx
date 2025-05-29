import { Text, View, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useProductos } from './Productos/useGetProducts';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Boton } from '../Componentes/Boton/boton';

export default function Home() {
  const { state, isLoading } = useAuth();
  const { actualizarDatos, error } = useProductos();
  const [loadingActualizar, setLoadingActualizar] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  const manejarActualizacion = async () => {
    try {
      setLoadingActualizar(true);
      await actualizarDatos();
    } finally {
      setLoadingActualizar(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Pantalla de inicio</Text>

      <Link href="/(tabs)/sales/newSales" asChild>
        <Boton label="Nueva venta" onPress={() => {}} />
      </Link>

      <Link href="/(tabs)/listaVentas/listSale" asChild>
        <Boton label="Lista de ventas" onPress={() => {}} />
      </Link>

      <Link href="/Productos/listaproductos" asChild>
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
