import { View, Text, Button } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function ProtectedScreen() {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isAuthenticated) {
      router.replace('/login');
    }
  }, [state.isAuthenticated]);

  const goToNewSales = () => {
    router.push('/sales/newSales');
  };

  return (
    <View style={{ padding: 30 }}>
      <Text>Contenido privado</Text>
      <Button title="Ir a nueva venta" onPress={goToNewSales} />
    </View>
  );
}
