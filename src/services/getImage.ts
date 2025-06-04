export interface Imagenes {
  id: number;
  urls: string[];
}

// Obtiene las url de las imagenes y devuelve una matriz
export async function fetchImagenes(): Promise<Imagenes[]> {
  const res = await fetch('http://192.168.0.219:5000/imagenes');
  const data: Imagenes[] = await res.json();
  return data;
}
