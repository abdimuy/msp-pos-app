import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext'; // ajusta la ruta según tu proyecto
import { useEffect, useState } from 'react'; 
import { initDB } from '../app/Database/database';

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false); 
  const [errorInitializingDb, setErrorInitializingDb] = useState(false); 

  useEffect(() => {
    const inicializarBaseDeDatos = async () => {
      try {
        await initDB();
        console.log('Base de datos inicializada correctamente.');
        setDbInitialized(true);
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        setErrorInitializingDb(true); 
      }
    };

    inicializarBaseDeDatos();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}