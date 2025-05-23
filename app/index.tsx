import { Text, View, Button, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useProductos } from './Productos/useGetProducts';
import { useEffect } from 'react';

const Home = () => {
  const { actualizarDatos, error } = useProductos();

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Hello, this is the home screen!
      </Text>

      <Link href="/Productos/ListaProductos" asChild>
        <Button title="Ver productos" />
      </Link>

      <Button title="Actualizar Datos" onPress={actualizarDatos} />
    </View>
  );
};

export default Home;
