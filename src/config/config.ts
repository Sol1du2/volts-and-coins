export default {
  redisUrl: process.env.VOLTS_N_COINS_REDIS_URL || 'redis://localhost:6379',
  blockchainBaseUrl: process.env.VOLTS_N_COINS_BLOCKCHAIN_BASE_URL || 'https://blockchain.info',

  blockAutoCacheIntervalHours: process.env.VOLTS_N_COINS_BLOCK_AUTO_CACHE_INTERVAL_HOURS
    ? parseInt(process.env.VOLTS_N_COINS_BLOCK_AUTO_CACHE_INTERVAL_HOURS)
    : 4,

  energyCostPerByte: process.env.VOLTS_N_COINS_ENERGY_COST_PER_BYTE
    ? parseFloat(process.env.VOLTS_N_COINS_ENERGY_COST_PER_BYTE)
    : 4.56,
};
