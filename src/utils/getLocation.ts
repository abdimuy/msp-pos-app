// utils/getLocation.ts
import * as Location from 'expo-location';

type Ubicacion = {
  latitud: string;
  longitud: string;
  direccion: string;
  location: Location.LocationObject;
};

type Opciones = {
  onUpdate?: (ubicacion: Ubicacion) => void;
  onError?: (error: string) => void;
};

export const watchLocation = async ({ onUpdate, onError }: Opciones) => {
  try {
    const subscriber = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 5,
      },
      async (location) => {
        const { latitude, longitude } = location.coords;

        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const direccion = reverseGeocode.length > 0
          ? `${reverseGeocode[0].street} ${reverseGeocode[0].streetNumber}, ${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].country}`
          : '';

        onUpdate?.({
          latitud: latitude.toString(),
          longitud: longitude.toString(),
          direccion,
          location,
        });
      }
    );

    return subscriber; // Para poder llamar `remove()` cuando ya no se necesite
  } catch (error) {
    onError?.('Error al obtener la ubicación');
    return null;
  }
};

export const getCurrentPosition = async (): Promise<Ubicacion | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const { latitude, longitude } = location.coords;

    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const direccion = reverseGeocode.length > 0
      ? `${reverseGeocode[0].street} ${reverseGeocode[0].streetNumber}, ${reverseGeocode[0].city}, ${reverseGeocode[0].region}, ${reverseGeocode[0].country}`
      : '';

    return {
      latitud: latitude.toString(),
      longitud: longitude.toString(),
      direccion,
      location,
    };
  } catch (error) {
    return null;
  }
};
