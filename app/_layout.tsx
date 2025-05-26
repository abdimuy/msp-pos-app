import { Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext'; 
import { useEffect, useState } from 'react'; 
import { ActivityIndicator, StyleSheet } from 'react-native';
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

  if (errorInitializingDb) {
  return (
    <SafeAreaView style={styles.centered}>
    </SafeAreaView>
  );
}

  if (!dbInitialized) {
    return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator size="large" />
    </SafeAreaView>);
  }

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

const styles = StyleSheet.create({
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
