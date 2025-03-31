import { Block } from '../models/Block';

export interface IBlockCacheStore {
  cacheBlock(block: Block): Promise<void>;
  getBlockByHash(hash: string): Promise<Block | null>;
  getBlocksByTimeRange(startTime: number, endTime: number): Promise<Block[]>;
}
