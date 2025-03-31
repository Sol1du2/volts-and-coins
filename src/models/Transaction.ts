import config from '../config/config';

export interface Transaction {
  hash: string; // identifier
  size: number; // in bytes
  energyConsumed: number; // computed as size * 4.56
}

export type TransactionData = {
  hash: string;
  size: number;
}

export function fromTransactionData(txData: TransactionData): Transaction {
  return {
    hash: txData.hash,
    size: txData.size,
    energyConsumed: txData.size * config.energyCostPerByte,
  };
}
