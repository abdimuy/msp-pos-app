import { getDB, Tx } from '../../../../app/database/database'; 

type ImageWithId = {
  image_id: number;
  local_path: string;
};

export const insertImagePathsIfNotExistLocal = async (
  articulo_id: number,
  imagenes: ImageWithId[],
  txn?: Tx
): Promise<void> => {
  const db = getDB();
  const database = txn ?? db;
  let newImagesCount = 0;

  for (const { image_id, local_path } of imagenes) {
    const existingImage = await database.getFirstAsync<{ imagen_id: number }>(
      `SELECT imagen_id FROM articulos_imagenes WHERE imagen_id = ?;`,
      [image_id]
    );

    if (!existingImage) {
      await database.runAsync(
        `INSERT INTO articulos_imagenes (imagen_id, articulo_id, ruta_local) VALUES (?, ?, ?);`,
        [image_id, articulo_id, local_path]
      );
      newImagesCount++;
    }
  }
  console.log(`Se insertaron ${newImagesCount} imágenes nuevas para el producto ${articulo_id}`);
};
