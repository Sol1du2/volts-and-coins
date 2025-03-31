import { EnergyConsumptionPerInterval } from "../models/EnergyConsumptionPerInterval";
import { BlockCacheService } from '../services/BlockCacheService';
import { RedisBlockCacheStore } from '../cache/RedisBlockCacheStore';
import config from '../config/config';
import { MS_PER_DAY } from '../constants/timeConstants';

const redisCacheStore = new RedisBlockCacheStore(config.redisUrl);
const blockCacheService = new BlockCacheService(redisCacheStore);

export async function getEnergyPerTransaction(blockHash: string) {
  const block = await blockCacheService.getBlock(blockHash);
  return block.transactions;
}

export async function getTotalEnergyConsumption(lastDays : number) {
  const results: EnergyConsumptionPerInterval[] = [];

  const today = new Date(Date.now());
  for (let i = 0; i < lastDays; i++) {
    // Request interval per day.
    // TODO(joao): It would be more efficient to just calculate the entire
    // interval and then compute all data. But for simplicity it is easier to
    // to get data day by day. This can easily be improved later.
    const startUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (lastDays - 1 - i)));
    const startTime = startUTC.getTime();
    const endTime = startTime + MS_PER_DAY + 1;

    try {
      const consumption = await blockCacheService.getEnergyConsumptionPerInterval(startTime, endTime);
      if (consumption) {
        results.push(consumption);
      } else {
        // TODO(joao): Missing data could be represented by 0 but maybe there
        // is a better solution.
        results.push({ startTime, endTime, totalEnergy: 0 });
      }
    } catch (error) {
      console.error(`error retrieving consumption for interval ${startTime} - ${endTime}`, error);
    }
  }

  return results;
}
