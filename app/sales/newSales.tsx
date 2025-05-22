import React, { useRef, useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Feather, AntDesign, Entypo } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';


export default function RegistrarCliente() {
  const [nombre, setNombre] = useState('');
  const [nombreTocado, setNombreTocado] = useState(false);
  const [fotosUris, setFotosUris] = useState<string[]>([]);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [mostrarSelectorFuente, setMostrarSelectorFuente] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const nombreInvalido = nombreTocado && nombre.trim() === '';

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

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos permisos para usar la cámara</Text>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

          {/* GALERÍA MINIATURAS */}
          {fotosUris.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
              {fotosUris.map((uri, index) => (
                <TouchableOpacity key={index} onPress={() => setImagenSeleccionada(uri)}>
                  <View style={styles.thumbWrapper}>
                    <Image source={{ uri }} style={styles.thumbnail} />
                    <TouchableOpacity style={styles.deleteIcon} onPress={() => eliminarFoto(index)}>
                      <AntDesign name="closecircle" size={16} color="red" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <ImageViewing
            images={[{ uri: imagenSeleccionada || '' }]}
            imageIndex={0}
            visible={!!imagenSeleccionada}
            onRequestClose={() => setImagenSeleccionada(null)}
            swipeToCloseEnabled
          />

          {/* BOTÓN SIGUIENTE */}
          <View style={styles.contenedor}>
            <TouchableOpacity
              style={[styles.nextButton, nombre.trim() === '' ? styles.nextButtonDisabled : null]}
              disabled={nombre.trim() === ''}
              onPress={() => {
                // Acción para siguiente
                console.log('Cliente:', nombre);
                console.log('Fotos:', fotosUris);
              }}>
              <Text style={styles.nextButtonText}>SIGUIENTE</Text>
            </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: { 
    padding: 20, 
    flex:1
  },
  contenedor: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  inputInvalid: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  errorText: {
    color: '#E74C3C',
    marginBottom: 10,
  },
  addButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007BFF',
  },
  scrollView: {
    marginBottom: 20,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  modalImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80%'
  },
  modalImage: {
    width: '90%',
    height: '30%',
    borderRadius: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#003366',
    paddingVertical: 12,
  },
  message: {
    textAlign: 'center',
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  button: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    marginBlockEnd: 19
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
  thumbnailContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  thumbnailWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  deleteIcon: {
    position: 'absolute',
    top: -0.7,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  nextButton: {
    height: 48,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#99CCFF',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cameraButtons: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  camBtn: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    marginBlockEnd: 20
  },
  camBtnText: {
    fontSize: 16,
    color: 'white',
  },
  modalOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  justifyContent: 'flex-end',
  zIndex: 10,
  marginBlockEnd:48
},
modalContainer: {
  backgroundColor: 'rgb(244, 234, 234)',
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  borderEndEndRadius:10,
  borderEndStartRadius: 10,
},
modalOption: {
  paddingVertical: 14,
  borderTopWidth: 1,
  borderTopColor: '#fff'
},
modalOptionText: {
  fontSize: 18,
  color: '#007BFF',
  textAlign: 'center',
},
modalCancelar: {
  paddingVertical: 14,
  marginTop: 10,
  borderTopWidth: 1,
  borderColor: '#fff',
},
modalCancelarText: {
  fontSize: 20,
  color: '#E74C3C',
  textAlign: 'center',
},
});