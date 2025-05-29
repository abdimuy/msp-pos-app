export interface Sale {
  id?: number;
  name: string;
  date: string; 
  status: number; // 0 o 1
  images: { id?: number; url: string }[];
}
