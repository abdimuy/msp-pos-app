export function convertPrices(pricesString: string): Record<string, number> {
  const parsedPrices: Record<string, number> = {};

  if (!pricesString) return parsedPrices;

  // Eliminar llave al inicio y al final si existen, y recortar espacios
  pricesString = pricesString.trim().replace(/^\{/, '').replace(/\}$/, '');

  pricesString.split(',').forEach((parte) => {
    const [keyRaw, priceValue] = parte.split(':').map((s) => s.trim());

    // Quitar comillas simples o dobles al inicio y fin de la clave
    const key = keyRaw.replace(/^['"]|['"]$/g, '');

    if (key && priceValue) {
      // Reemplazar coma por punto y quitar símbolos no numéricos excepto punto
      const cleanedValue = priceValue.replace(',', '.').replace(/[^0-9.]/g, '');

      const numericValue = Number(cleanedValue);

      if (!isNaN(numericValue)) {
        parsedPrices[key] = numericValue;
      }
    }
  });

  return parsedPrices;
}
