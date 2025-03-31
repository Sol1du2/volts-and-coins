import { IBlockCacheStore } from '../cache/IBlockCacheStore';
import { getBlockSummariesForTimestamp, getBlockByHash } from './blockchainService';
import { EnergyConsumptionPerInterval } from '../models/EnergyConsumptionPerDay';

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
    let totalEnergy = 0;

    const blockSummaries = await getBlockSummariesForTimestamp(endTime);
    for (const blockSummary of blockSummaries) {
      if (blockSummary.time < startTime) {
        break;
      }

      const block = await getBlockByHash(blockSummary.hash);
      await this.cacheStore.cacheBlock(block);

      const blockEnergy = block.transactions.reduce((sum, tx) => sum + tx.energyConsumed, 0);
      totalEnergy += blockEnergy;
    }

    if (totalEnergy == 0) {
      return null;
    }

    return { startTime, endTime, totalEnergy };
  }
}
