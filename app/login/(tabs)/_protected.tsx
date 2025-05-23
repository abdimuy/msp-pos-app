import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const { state, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !state.isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, state.isAuthenticated]);

  if (isLoading || !state.isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Verificando autenticación...</Text>
      </View>
    );
  }

  return <Slot />;
}
