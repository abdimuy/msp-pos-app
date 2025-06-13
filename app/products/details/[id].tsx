import { useMemo, useState } from 'react';
import { View, Text, Image, Button, Modal, TouchableOpacity } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useGetImagesById } from './useGetImagesById';
import { useLocalSearchParams, Link } from 'expo-router';
import { useGetProductById } from './useGetProductById ';

export default function DetalleProducto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idNum = Number(id);

  const { imagenes, loading: loadingImagenes, error: errorImagenes } = useGetImagesById(idNum);
  const { producto, loading: loadingProducto, error: errorProducto } = useGetProductById(idNum);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  //Prepara las imagenes para el componente ImageViewer, que espera un array de objetos con la propiedad url.
  const images = useMemo(() => {
    return imagenes.map((uri) => ({
      url: uri.startsWith('file://') ? uri : 'file://' + uri,
    }));
  }, [imagenes]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Detalles del producto</Text>

      {loadingImagenes && <Text>Cargando imágenes...</Text>}
      {errorImagenes && <Text style={{ color: 'red' }}>{errorImagenes}</Text>}

      {imagenes.map((url, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setCurrentIndex(index);
            setModalVisible(true);
          }}
          style={{ marginVertical: 10 }}>
          <Image
            source={{ uri: url }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ))}

      {loadingProducto && <Text>Cargando productos...</Text>}
      {errorProducto && <Text style={{ color: 'red' }}>{errorProducto}</Text>}
      {producto && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18 }}>Nombre: {producto.ARTICULO}</Text>
          <Text style={{ fontSize: 18 }}>Precio: ${producto.PRECIO.toFixed(2)}</Text>
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
    </View>
  );
}
