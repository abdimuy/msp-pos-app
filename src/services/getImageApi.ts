import axios from 'axios';

export interface Imagenes {
  id: number;
  urls: string[];
}

// Obtiene las url de las imagenes y devuelve una matriz
export async function getImageApi(): Promise<Imagenes[]> {
  const res = await axios('http://192.168.0.214:5000/imagenes');
  const data: Imagenes[] = res.data;
  return data;
}
