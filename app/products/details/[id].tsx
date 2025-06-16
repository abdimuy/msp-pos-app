import { useMemo, useState } from 'react';
import { View, Text, Image, Button, Modal, TouchableOpacity, ScrollView } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useGetImagesById } from './useGetImagesById';
import { useLocalSearchParams, Link } from 'expo-router';
import { useGetProductById } from './useGetProductById ';
import { styles } from '../details/DetailsProducts.styles';
import { convertPrices } from '~/services/convertPrices';
import { Ionicons } from '@expo/vector-icons';

export default function DetalleProducto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idNum = Number(id);

  const { imagenes, loading: loadingImagenes, error: errorImagenes } = useGetImagesById(idNum);
  const { producto, loading: loadingProducto, error: errorProducto } = useGetProductById(idNum);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = useMemo(() => {
    return imagenes.map((uri) => ({
      url: uri.startsWith('file://') ? uri : 'file://' + uri,
    }));
  }, [imagenes]);

  const parsedPrices = useMemo(() => {
    if (!producto?.PRECIOS) return {};
    return convertPrices(producto.PRECIOS);
  }, [producto?.PRECIOS]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{producto?.ARTICULO}</Text>
      </View>

      {loadingImagenes && <Text style={styles.text}>Cargando imágenes...</Text>}

      {imagenes.length > 0 ? (
        imagenes.map((url, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              setModalVisible(true);
            }}
            style={styles.imageWrapper}>
            <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.imageWrapper}>
          <Ionicons name="image-outline" size={150} color="#94A3B8" />
        </View>
      )}
      {errorImagenes && <Text style={styles.error}>{errorImagenes}</Text>}
      {loadingProducto && <Text style={styles.text}>Cargando productos...</Text>}
      {errorProducto && <Text style={styles.error}>{errorProducto}</Text>}

      {producto && (
        <View style={styles.infoCard}>
          <Text style={styles.name}>PRECIOS</Text>
          {Object.keys(parsedPrices).length > 0 ? (
            Object.entries(parsedPrices).map(([tipo, valor]) => (
              <Text key={tipo} style={styles.text}>
                {tipo}: <Text style={styles.priceMeses}>${valor.toFixed(2)}</Text>
              </Text>
            ))
          ) : (
            <Text style={styles.text}>No hay precios disponibles.</Text>
          )}
        </View>
      )}

      <Link href="/products/ProductsList" asChild>
        <Button title="Atrás" />
      </Link>

      <Modal
        visible={modalVisible}
        transparent={false}
        onRequestClose={() => setModalVisible(false)}>
        <ImageViewer
          imageUrls={images}
          index={currentIndex}
          onCancel={() => setModalVisible(false)}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
          saveToLocalByLongPress={false}
        />
      </Modal>
    </ScrollView>
  );
}
