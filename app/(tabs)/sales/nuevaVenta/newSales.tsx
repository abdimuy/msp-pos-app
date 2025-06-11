import { useRef, useState, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
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
import { Boton } from '../../../../Componentes/Boton/boton';
import { Link, useRouter } from 'expo-router';
import { SaleAndImages } from 'Types/Sale';
import { insertarVenta } from 'app/Database/database';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { watchLocation, getCurrentPosition } from '../../../../src/utils/getLocation';
import { useGetPermission } from '../hooks/useGetPermission';

export default function RegistrarCliente() {
  const [nombre, setNombre] = useState('');
  const [nombreTocado, setNombreTocado] = useState(false);
  const [fotosUris, setFotosUris] = useState<string[]>([]);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [mostrarSelectorFuente, setMostrarSelectorFuente] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [direccion, setDireccion] = useState('');
  const { hasPermission, requestLocationPermission } = useGetPermission();

  const nombreInvalido = nombreTocado && nombre.trim() === '';

  useEffect(() => {
    requestLocationPermission();
  }, []);
  
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const iniciarUbicacion = async () => {
      if (hasPermission === null) return; // Esperar a que se cargue el permiso
      if (!hasPermission) {
        setErrorMsg('Permiso denegado para acceder a la ubicación');
        return;
      }

      const cancelFn = await watchLocation({
        onUpdate: (ubicacion) => {
          setLatitud(ubicacion.latitud);
          setLongitud(ubicacion.longitud);
          setDireccion(ubicacion.direccion);
          setLocation(ubicacion.location);
        },
        onError: (error) => setErrorMsg(error),
      });

      subscription = cancelFn;
    };

    iniciarUbicacion();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [hasPermission]);

  const tomarFoto = async () => {
    if (cameraRef.current) {
      const foto = await cameraRef.current.takePictureAsync();
      setFotosUris((prev) => [...prev, foto.uri]);
      setMostrarCamara(false);
    }
  };
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  const abrirSelectorFuente = () => {
    setMostrarSelectorFuente(true);
  };

  const abrirGaleria = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFotosUris((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const eliminarFoto = (index: number) => {
    setFotosUris((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleSiguiente = async () => {
    setIsLoading(true);

    const ubicacion = await getCurrentPosition();

    if (!ubicacion) {
      alert('No se puede tener la ubicacion');
      setIsLoading(false);
      return;
    }

    const nuevaVenta: SaleAndImages = {
      id: uuid.v4(),
      name: nombre,
      date: new Date().toISOString(),
      status: 0,
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      images: fotosUris.map((url) => ({ url })),
    };
    await insertarVenta(nuevaVenta);
    setNombre('');
    setFotosUris([]);
    setIsLoading(false);
    router.replace('/(tabs)/sales/listaVentas/listSale');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {mostrarCamara ? (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} enableTorch={false}>
          <View style={styles.cameraButtons}>
            <TouchableOpacity style={styles.camBtn} onPress={toggleCameraFacing}>
              <Text style={styles.camBtnText}>Cambiar Camara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.camBtn} onPress={tomarFoto}>
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
          <TouchableOpacity style={styles.addButton} onPress={abrirSelectorFuente}>
            <Entypo name="camera" size={20} color="#007BFF" />
            <Text style={styles.addButtonText}>Agregar fotos</Text>
          </TouchableOpacity>

          <View style={{ flexGrow: 1, maxHeight: 500 }}>
            {/* GALERÍA MINIATURAS */}
            {fotosUris.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.scrollView}>
                {fotosUris.map((uri, index) => (
                  <TouchableOpacity key={index} onPress={() => setImagenSeleccionada(uri)}>
                    <View style={styles.thumbWrapper}>
                      <Image source={{ uri }} style={styles.thumbnail} />
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => eliminarFoto(index)}>
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
              <Text>{direccion}</Text>
            </View>
          </View>

          <ImageViewing
            images={[{ uri: imagenSeleccionada || '' }]}
            imageIndex={0}
            visible={!!imagenSeleccionada}
            onRequestClose={() => setImagenSeleccionada(null)}
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
      {mostrarSelectorFuente && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setMostrarSelectorFuente(false);
                setMostrarCamara(true);
              }}>
              <Text style={styles.modalOptionText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setMostrarSelectorFuente(false);
                abrirGaleria();
              }}>
              <Text style={styles.modalOptionText}>Seleccionar de Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelar}
              onPress={() => setMostrarSelectorFuente(false)}>
              <Text style={styles.modalCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
