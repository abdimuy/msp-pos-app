export interface SaleBase {
  id: string;
  name: string;
  date: string;
  status: number; // 0 o 1
  latitud: string;
  longitud: string;
}

export type Sale = SaleBase;

export interface SaleImage {
  id: number;
  url: string;
}

export interface CreateSaleImage {
  url: string;
}

export type SaleAndImages = Sale & { images: CreateSaleImage[] };

export type SaleWithSavedImages = Sale & { images: SaleImage[] };
