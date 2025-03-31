import { Transaction, TransactionData, fromTransactionData } from './Transaction';
import { MS_PER_SECOND } from '../constants/timeConstants';

export interface Block {
  hash: string; // identifier
  time: number; // in ms
  transactions: Transaction[];
}

export type BlockData = {
  hash: string;
  time: number;
  tx?: TransactionData[];
}

export function fromBlockData(blockData: BlockData): Block {
  let block: Block = {
    hash: blockData.hash,
    time: blockData.time * MS_PER_SECOND,
    transactions: [],
  };

  if (blockData.tx !== undefined) {
    block.transactions = blockData.tx.map((tx: TransactionData) => (
      fromTransactionData(tx)
    ));
  }

  return block
}
