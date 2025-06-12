import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  TextInput,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect, useMemo, useCallback } from 'react';
import fuzzysort from 'fuzzysort';
import { Ionicons } from '@expo/vector-icons';
import { useGetProductos } from './useGetProductos';
import { ProductoConImagen } from '../../Types/Producto';
import { styles } from './ListaProductos.styles';

export default function ListaProductos() {
  const [filtro, setFiltro] = useState('');
  const { productos, loading, error } = useGetProductos();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const productosFiltrados = useMemo(() => {
    if (filtro) {
      return fuzzysort
        .go(
          filtro,
          productos.filter((p) => p.EXISTENCIAS > 0),
          { key: 'ARTICULO' }
        )
        .map((result) => result.obj);
    } else {
      return productos.filter((p) => p.EXISTENCIAS > 0);
    }
  }, [filtro, productos]);

  const renderItem = useCallback(
    ({ item }: { item: ProductoConImagen }) => <ProductoCard item={item} />,
    []
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

      <Link href="/" asChild>
        <Button title="Atrás" />
      </Link>
    </View>
  );
}

function ProductoCard({ item }: { item: ProductoConImagen }) {
  const [errorCarga, setErrorCarga] = useState(false);

  return (
    <Link href={`/Productos/Detalles/${item.ARTICULO_ID}`} asChild>
      <TouchableOpacity activeOpacity={0.9} style={styles.card}>
        {errorCarga ? (
          <View style={[styles.imagen, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={36} color="#94A3B8" />
          </View>
        ) : (
          <Image
            source={{ uri: 'file://' + item.IMAGEN_RUTA }}
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
    </Link>
  );
}
