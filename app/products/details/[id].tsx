import { useMemo, useState } from 'react';
import { View, Text, Image, Button, Modal, TouchableOpacity, ScrollView } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useGetImagesById } from './useGetImagesById';
import { useLocalSearchParams, Link } from 'expo-router';
import { useGetProductById } from './useGetProductById ';
import { styles } from '../details/DetailsProducts.styles';

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{producto?.ARTICULO}</Text>
      </View>

      {loadingImagenes && <Text style={styles.text}>Cargando imágenes...</Text>}
      {errorImagenes && <Text style={styles.error}>{errorImagenes}</Text>}

      {imagenes.map((url, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setCurrentIndex(index);
            setModalVisible(true);
          }}
          style={styles.imageWrapper}>
          <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
        </TouchableOpacity>
      ))}

      {loadingProducto && <Text style={styles.text}>Cargando productos...</Text>}
      {errorProducto && <Text style={styles.error}>{errorProducto}</Text>}

      {producto && (
        <View style={styles.infoCard}>
          <Text style={styles.name}>PRECIOS</Text>
          <Text style={styles.price}>${producto.PRECIO.toFixed(2)}</Text>
          <Text style={styles.text}>
            precio de lista <Text style={styles.price}>${producto.PRECIO.toFixed(2)}</Text>
          </Text>
          <Text style={styles.text}>
            a 1 mes <Text style={styles.price}>${producto.PRECIO.toFixed(2)}</Text>
          </Text>
          <Text style={styles.text}>
            a 4 meses <Text style={styles.price}>${producto.PRECIO.toFixed(2)}</Text>
          </Text>
        </View>
      )}

      {producto && (
        <View style={styles.descripcionCard}>
          <Text style={styles.descripcionTitulo}>Descripción</Text>
          <Text style={styles.descripcionTexto}>
            <Text>
              Este producto es de alta calidad y cumple con los estándares del mercado. Está
              fabricado con materiales duraderos que garantizan un rendimiento óptimo y una larga
              vida útil.
            </Text>
          </Text>
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
