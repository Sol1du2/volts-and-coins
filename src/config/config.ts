export default {
  redisUrl: process.env.VOLTS_N_COINS_REDIS_URL || 'redis://localhost:6379',
  blockchainBaseUrl: process.env.VOLTS_N_COINS_BLOCKCHAIN_BASE_URL || 'https://blockchain.info',

  blockCacheIntervalSeconds: process.env.VOLTS_N_COINS_BLOCK_CACHE_INTERVAL_SECONDS
    ? parseInt(process.env.VOLTS_N_COINS_BLOCK_CACHE_INTERVAL_SECONDS)
    : 14400,
  blockCacheMaxConcurrency: process.env.VOLTS_N_COINS_BLOCK_CACHE_MAX_CONCURRENCY
    ? parseInt(process.env.VOLTS_N_COINS_BLOCK_CACHE_MAX_CONCURRENCY)
    : 1000,

  energyCostPerByte: process.env.VOLTS_N_COINS_ENERGY_COST_PER_BYTE
    ? parseFloat(process.env.VOLTS_N_COINS_ENERGY_COST_PER_BYTE)
    : 4.56,
};
