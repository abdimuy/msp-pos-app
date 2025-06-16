import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: string;
  longitude: string;
  address: string;
  location: Location.LocationObject;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    const initLocation = async () => {
      const savedPermission = await AsyncStorage.getItem('permiso_ubicacion');

      let status: Location.PermissionStatus;

      if (savedPermission === 'granted') {
        status = Location.PermissionStatus.GRANTED;
      } else {
        const { status: requestStatus } = await Location.requestForegroundPermissionsAsync();
        status = requestStatus;
        if (status === Location.PermissionStatus.GRANTED) {
          await AsyncStorage.setItem('permiso_ubicacion', 'granted');
        }
      }

      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        return;
      }

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 5,
        },
        async (position) => {
          setLocation(position);
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());

          const addressInfo = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          if (addressInfo.length > 0) {
            const a = addressInfo[0];
            const addr = `${a.street} ${a.streetNumber}, ${a.city}, ${a.region}, ${a.country}`;
            setAddress(addr);
          }
        }
      );
    };

    initLocation();

    return () => {
      if (subscriber) subscriber.remove();
    };
  }, []);

  return { location, latitude, longitude, address, errorMsg };
};
