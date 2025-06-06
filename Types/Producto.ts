export type ProductoBase = {
  ARTICULO_ID: number;
  ARTICULO: string;
  EXISTENCIAS: number;
  PRECIO: number;
};

export type ProductoConImagen = ProductoBase & {
  IMAGEN_RUTA: string | null;
};

export type Producto = ProductoBase;
