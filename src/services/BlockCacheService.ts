import { IBlockCacheStore } from '../cache/IBlockCacheStore';
import { getBlockSummariesForTimestamp, getBlockByHash } from './blockchainService';
import { EnergyConsumptionPerInterval } from '../models/EnergyConsumptionPerInterval';
import config from '../config/config';

import pLimit from 'p-limit';

export class BlockCacheService {
  constructor(private cacheStore: IBlockCacheStore) {}

  /// Tries to fetch a block from the cache. If it's not there it fetches it
  /// from the blockchain.
  async getBlock(hash: string) {
    const cachedBlock = await this.cacheStore.getBlockByHash(hash);
    if (cachedBlock) {
      return cachedBlock;
    }

    const block = await getBlockByHash(hash);
    await this.cacheStore.cacheBlock(block);

    return block;
  }

  /// Fetches the total energy consumption of a specific interval.
  /// At the moment this only uses the cache. It is assumed the cache is built
  /// via a chron job every few hours. This can result in data that is not so
  /// up-to-date. For simplicity, we accept this. But for production purposes
  /// this would need to be improved.
  async getEnergyConsumptionPerInterval(startTime: number, endTime: number): Promise<EnergyConsumptionPerInterval | null> {
    // Retrieve all cached blocks in the interval.
    const blocks = await this.cacheStore.getBlocksByTimeRange(startTime, endTime);
    if (blocks.length === 0) {
      return null;
    }

    // Sum energy consumption over all blocks.
    const totalEnergy = blocks.reduce((totalBlock, block) =>
      totalBlock + block.transactions.reduce((totalTx, tx) =>
        totalTx + tx.energyConsumed, 0), 0);

    return { startTime, endTime, totalEnergy };
  }

  /// Fetches all blocks in a certain interval, computes their energy, stores it
  /// and returns to total energy.
  /// This function deliberately avoids fetching the cache in order to update
  /// potentially stale entries.
  /// TODO(joao): This could potentially be done a bit more elegantly by
  /// having a way to tell how old the cache data is, for example. But that is
  /// an exercise for another day :)
  async computeAndStoreBlocksForInterval(startTime: number, endTime: number): Promise<EnergyConsumptionPerInterval | null> {
    const blockSummaries = await getBlockSummariesForTimestamp(endTime);

    // It seems the blockchain API sends the blocks ordered by time so stopping
    // here is enough. This would have to be properly verified and tested
    // before production though.
    // If not, it would be trivial to make sure our service returns them
    // ordered.
    const index = blockSummaries.findIndex(blockSummary => blockSummary.time < startTime);
    const summariesToProcess = index === -1 ? blockSummaries : blockSummaries.slice(0, index);

    const limit = pLimit(config.blockCacheMaxConcurrency);
    const energyPromises = summariesToProcess.map((blockSummary) =>
      limit(async () => {
        const block = await getBlockByHash(blockSummary.hash);
        await this.cacheStore.cacheBlock(block);

        return block.transactions.reduce((sum, tx) => sum + tx.energyConsumed, 0);
      })
    );

    const energyValues = await Promise.all(energyPromises);
    const totalEnergy = energyValues.reduce((sum, energy) => sum + energy, 0);

    return { startTime, endTime, totalEnergy };
  }
}
