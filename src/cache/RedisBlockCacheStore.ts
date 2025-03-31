import { createClient, RedisClientType } from 'redis';

import { IBlockCacheStore as IBlockCacheStore } from './IBlockCacheStore';
import { Block } from '../models/Block';

export class RedisBlockCacheStore implements IBlockCacheStore {
  private client: RedisClientType ;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });
    this.client.connect().catch(console.error);
  }

  async cacheBlock(block: Block): Promise<void> {
    const key = `block:${block.hash}`;
    await this.client.set(key, JSON.stringify(block));
    // Add to the sorted set with score as the block time.
    // This allows us to fetch blocks per interval.
    await this.client.zAdd('blocks_by_time', [{ score: block.time, value: block.hash }]);
  }

  async getBlockByHash(hash: string): Promise<Block | null> {
    const key = `block:${hash}`;
    const data = await this.client.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as Block;
  }

  async getBlocksByTimeRange(startTime: number, endTime: number): Promise<Block[]> {
    const hashes = await this.client.zRangeByScore('blocks_by_time', startTime, endTime);
    const blocks: Block[] = [];
    for (const hash of hashes) {
      const block = await this.getBlockByHash(hash);
      if (block) {
        blocks.push(block);
      }
    }
    return blocks;
  }
}
