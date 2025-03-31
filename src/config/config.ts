export default {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  blockchainBaseUrl: process.env.BLOCKCHAIN_BASE_URL || 'https://blockchain.info',

  energyCostPerByte: process.env.ENERGY_COST_PER_BYTE
    ? parseFloat(process.env.ENERGY_COST_PER_BYTE)
    : 4.56,
};
