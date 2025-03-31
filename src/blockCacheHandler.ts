import { RedisBlockCacheStore } from './cache/RedisBlockCacheStore';
import { BlockCacheService } from './services/BlockCacheService';
import config from './config/config';

export const handler = async (): Promise<void> => {
  const redisCacheStore = new RedisBlockCacheStore(config.redisUrl);
  const preAggregationService = new BlockCacheService(redisCacheStore);

  /*const now = new Date();
  const yesterdayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const startTime = yesterdayUTC.getTime();
  const endTime = startTime + 24 * 3600 * 1000 - 1;*/

  const now = new Date();
  const startTime = now.getTime() - 4 * 3600 * 1000; // 4 hours ago
  const endTime = now.getTime() - 1;

  try {
    console.info(`fetching blocks from ${startTime} to ${endTime}`);
    const totalEnergy = await preAggregationService.computeAndStoreBlocksForInterval(startTime, endTime);
    console.info(`successfully stored blocks, total_energy=${totalEnergy}`);
  } catch (error) {
    console.error('error during auto caching,', error);
  }
};
