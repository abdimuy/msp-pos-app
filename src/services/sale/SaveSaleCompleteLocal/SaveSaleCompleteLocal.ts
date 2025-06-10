import { Sale } from '../../../../type/Sale';
import { Tx } from '../../../../app/database/database';
import { insertSaleLocal } from '../insertSaleLocal/insertSaleLocal';
import { insertSaleImagesLocal } from '../insertSaleImagesLocal/insertSaleImagesLocal';

export const SaveSaleCompleteLocal = async (venta: Sale, txn?: Tx): Promise<void> => {
  await insertSaleLocal(venta, txn);
  await insertSaleImagesLocal(venta, txn);
};
