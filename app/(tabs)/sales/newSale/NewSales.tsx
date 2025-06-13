import { useRef, useState, useEffect } from 'react';
import { CameraView, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, AntDesign, Entypo } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { styles } from './_newSales.styles';
import { Boton } from '../../../../components/boton/Boton';
import { Link, useRouter } from 'expo-router';
import { SaleAndImages } from 'type/Sale';
import { SaveSaleCompleteLocal } from '../../../../src/services/sale/SaveSaleCompleteLocal/SaveSaleCompleteLocal';
import uuid from 'react-native-uuid';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useGetLocation';

export default function RegistrarCliente() {
  const [nombre, setNombre] = useState('');
  const [nombreTocado, setNombreTocado] = useState(false);
  const [photosUris, setPhotosUris] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
const { location, latitude, longitude, address, errorMsg } = useLocation();

  const nombreInvalido = nombreTocado && nombre.trim() === '';

  const takePhoto = async () => {
    if (cameraRef.current) {
      const foto = await cameraRef.current.takePictureAsync();
      setPhotosUris((prev) => [...prev, foto.uri]);
      setShowCamera(false);
    }
  };
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openSourceSelector = () => {
    setShowSourceSelector(true);
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotosUris((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const deletePhoto = (index: number) => {
    setPhotosUris((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleSiguiente = async () => {
    setIsLoading(true);

    if (!latitude || !longitude) {
      alert('No se puede tener la ubicacion');
      setIsLoading(false);
      return;
    }

    const nuevaVenta: SaleAndImages = {
      id: uuid.v4(),
      name: nombre,
      date: new Date().toISOString(),
      status: 0,
      latitud: latitude,
      longitud: longitude,
      images: photosUris.map((url) => ({ url })),
    };
    await SaveSaleCompleteLocal(nuevaVenta);
    setNombre('');
    setPhotosUris([]);
    setIsLoading(false);
    router.replace('/(tabs)/sales/saleList/ListSale');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {showCamera ? (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} enableTorch={false}>
          <View style={styles.cameraButtons}>
            <TouchableOpacity style={styles.camBtn} onPress={toggleCameraFacing}>
              <Text style={styles.camBtnText}>Cambiar Camara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.camBtn} onPress={takePhoto}>
              <Text style={styles.camBtnText}>Tomar Foto</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* HEADER */}
          <Text style={styles.header}>Registrar Cliente</Text>

          {/* INPUT NOMBRE */}
          <View style={[styles.inputContainer, nombreInvalido ? styles.inputInvalid : null]}>
            <Feather name="edit-3" size={16} color="#007BFF" style={styles.inputIcon} />
            <TextInput
              placeholder="Nombre completo"
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              onBlur={() => setNombreTocado(true)}
              placeholderTextColor="#999"
            />
          </View>
          {nombreInvalido && <Text style={styles.errorText}>El nombre es obligatorio</Text>}

          {/* BOTÓN AGREGAR FOTOS */}
          <TouchableOpacity style={styles.addButton} onPress={openSourceSelector}>
            <Entypo name="camera" size={20} color="#007BFF" />
            <Text style={styles.addButtonText}>Agregar fotos</Text>
          </TouchableOpacity>

          <View style={{ flexGrow: 1, maxHeight: 500 }}>
            {/* GALERÍA MINIATURAS */}
            {photosUris.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.scrollView}>
                {photosUris.map((uri, index) => (
                  <TouchableOpacity key={index} onPress={() => setSelectedImage(uri)}>
                    <View style={styles.thumbWrapper}>
                      <Image source={{ uri }} style={styles.thumbnail} />
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => deletePhoto(index)}>
                        <AntDesign name="closecircle" size={16} color="red" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View>
              <Text style={{ paddingBottom: 10 }}>Agregar Ubicación</Text>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location ? location.coords.latitude : 0,
                  longitude: location ? location.coords.longitude : 0,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.04,
                }}>
                {location && (
                  <Marker
                    coordinate={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }}
                    title="Tu ubicación"
                  />
                )}
              </MapView>
              <Text>{address}</Text>
            </View>
          </View>

          <ImageViewing
            images={[{ uri: selectedImage || '' }]}
            imageIndex={0}
            visible={!!selectedImage}
            onRequestClose={() => setSelectedImage(null)}
            swipeToCloseEnabled
          />
          {/* BOTÓN SIGUIENTE */}
          <View style={styles.contenedor}>
            <Boton
              onPress={handleSiguiente}
              disabled={nombre.trim() === '' || isLoading}
              loading={isLoading}
              label="SIGUIENTE"
              variant="primary"
              size="large"
            />

            <Link href="/" asChild>
              <Button title="Atrás" onPress={() => {}} />
            </Link>
          </View>
        </ScrollView>
      )}
      {showSourceSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowSourceSelector(false);
                setShowCamera(true);
              }}>
              <Text style={styles.modalOptionText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowSourceSelector(false);
                openGallery();
              }}>
              <Text style={styles.modalOptionText}>Seleccionar de Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelar}
              onPress={() => setShowSourceSelector(false)}>
              <Text style={styles.modalCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
