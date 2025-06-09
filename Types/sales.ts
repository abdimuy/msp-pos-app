export interface Sale {
  id: string;
  name: string;
  date: string; 
  status: number; // 0 o 1
  latitud: string;
  longitud: string;
  images: { id?: number; url: string }[];
}
