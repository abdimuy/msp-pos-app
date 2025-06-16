export type ProductoBase = {
  ARTICULO_ID: number;
  ARTICULO: string;
  EXISTENCIAS: number;
  PRECIOS: string;
};

export type ProductoConImagen = ProductoBase & {
  IMAGEN_RUTA: string | null; 
};

export type ProductoConImagenParseado = Omit<ProductoConImagen, 'PRECIOS'> & {
  PRECIOS: Record<string, number>;
};

export type Producto = ProductoBase;
