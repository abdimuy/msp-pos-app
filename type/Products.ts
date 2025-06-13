export type ProductoBase = {
  ARTICULO_ID: number;
  ARTICULO: string;
  EXISTENCIAS: number;
  PRECIOS: string;
};

export type ProductoConPreciosSeparados = ProductoBase & {
  preciosSeparados: {
    'Precio de lista': number;
    'Precio 4 Meses': number;
    'Precio 1 Meses': number;
  };
};

export type ProductoConImagen = ProductoBase & {
  IMAGEN_RUTA: string | null;
};

export type Producto = ProductoBase;
