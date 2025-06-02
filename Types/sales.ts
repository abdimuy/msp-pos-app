export interface Sale {
  id: string;
  name: string;
  date: string; 
  status: number; // 0 o 1
  images: { id?: number; url: string }[];
}
