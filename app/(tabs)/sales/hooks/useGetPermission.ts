// hooks/useGetPermission.ts
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'location_permission_granted';

export function useGetPermission() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      setHasPermission(true);
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } else {
      setHasPermission(false);
    }
  };

  const verificarPermisoGuardado = async () => {
    const valor = await AsyncStorage.getItem(STORAGE_KEY);
    if (valor === 'true') {
      setHasPermission(true);
    } else {
      setHasPermission(false);
    }
  };

  useEffect(() => {
    verificarPermisoGuardado();
  }, []);

  return {
    hasPermission,
    requestLocationPermission,
  };
}