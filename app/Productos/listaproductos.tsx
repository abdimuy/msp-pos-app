import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Button, TextInput } from "react-native";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import api from "../api"; 
import fuzzysort from "fuzzysort";
import { Ionicons } from '@expo/vector-icons';

export default function ListaProductos() {
  const [filtro, setFiltro] = useState('');
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get('/articulos');
      console.log('Respuesta API:', respuesta.data);
      setProductos(Array.isArray(respuesta.data.body) ? respuesta.data.body : []);
    } catch (error) {
      console.log('Error al cargar productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = filtro
    ? fuzzysort.go(filtro, productos.filter(p => p.EXISTENCIAS > 0), {
        key: 'ARTICULO',
      }).map(result => result.obj)
    : productos.filter(p => p.EXISTENCIAS > 0);

  const renderItem = ({ item }: { item: any }) => (
    <ProductoCard item={item} />
  );

  return (
    <View style={styles.contenedor}>
      <Text style={styles.header}>Productos</Text>

      <TextInput
        style={styles.inputFiltro}
        placeholder="Buscar producto..."
        value={filtro}
        onChangeText={setFiltro}
      />

      {loading ? (
        <Text>Cargando productos...</Text>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.ARTICULO_ID.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text>No se encontraron productos.</Text>}
        />
      )}

      <Link href="#" asChild>
        <Button title="Inicio" />
      </Link>
    </View>
  );
}


function ProductoCard({ item }: { item: any }) {
  const [errorCarga, setErrorCarga] = useState(false);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      {errorCarga ? (
        <View style={[styles.imagen, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="image-outline" size={36} color="#94A3B8" />
        </View>
      ) : (
        <Image
          source={{ uri: 'https://via.placeholder.com/80' }}
          style={styles.imagen}
          resizeMode="cover"
          onError={() => setErrorCarga(true)}
        />
      )}
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.ARTICULO}</Text>
        <Text style={styles.stock}>Stock: {item.EXISTENCIAS}</Text>
        <Text style={styles.stock}>Precio: ${Number(item.PRECIO).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#003366',
    paddingVertical: 12,
  },
  inputFiltro: {
    height: 40,
    borderColor: '#003366',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  lista: {
    paddingBottom: 16,
    paddingTop: 16,
  },
  card: {
    height: 96,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    padding: 8,
  },
  imagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
  },
  stock: {
    fontSize: 14,
    fontWeight: '400',
    color: '#0056B3',
  },
});
