import { Transaction, TransactionData, fromTransactionData } from './Transaction';

const MILLISECONDS = 1000;

export interface Block {
  hash: string; // identifier
  time: number; // in ms
  transactions: Transaction[];
}

export type BlockData = {
  hash: string;
  time: number;
  tx: TransactionData[];
}

export function fromBlockData(blockData: BlockData): Block {
  return {
    hash: blockData.hash,
    time: blockData.time * MILLISECONDS,
    transactions: blockData.tx.map((tx: TransactionData) => (
      fromTransactionData(tx)
    )),
  };
}
