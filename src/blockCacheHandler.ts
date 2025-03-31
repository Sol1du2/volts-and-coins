import { RedisBlockCacheStore } from './cache/RedisBlockCacheStore';
import { BlockCacheService } from './services/BlockCacheService';
import config from './config/config';
import { MS_PER_HOUR } from './constants/timeConstants';

export const handler = async (): Promise<void> => {
  const redisCacheStore = new RedisBlockCacheStore(config.redisUrl);
  const preAggregationService = new BlockCacheService(redisCacheStore);

  const now = new Date();
  const startTime = now.getTime() - config.blockAutoCacheIntervalHours * MS_PER_HOUR;
  const endTime = now.getTime() - 1;

  try {
    console.info(`fetching blocks from ${startTime} to ${endTime}`);
    const totalEnergy = await preAggregationService.computeAndStoreBlocksForInterval(startTime, endTime);
    if (!totalEnergy) {
      console.info(`no blocks found for interval ${startTime}-${endTime}`);
    } else {
      console.info(`successfully stored blocks, total_energy=${totalEnergy.totalEnergy}`);
    }
  } catch (error) {
    console.error('error during auto caching,', error);
  }
};
