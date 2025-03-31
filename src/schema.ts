import { SchemaComposer } from 'graphql-compose'
import { GraphQLBigInt } from 'graphql-scalars';
import { getEnergyPerTransaction, getTotalEnergyConsumption } from './resolvers/energyResolver';

const schemaComposer = new SchemaComposer()

schemaComposer.Query.addFields({
  // Query to get transactions of a block with computed energy consumption.
  getBlockEnergy: {
    type: '[Transaction!]!',
    args: {
      blockHash: 'String!',
    },
    resolve: async (_, { blockHash }) => {
      console.info(`fetching energy data for block: ${blockHash}`);
      return await getEnergyPerTransaction(blockHash);
    },
  },

  // Query to get aggregated energy consumption per day for the last X days.
  getDailyEnergyConsumption: {
    type: '[EnergyConsumptionPerDay!]!',
    args: {
      lastDays: 'Int!',
    },
    resolve: async (_, { lastDays }) => {
      console.info(`fetching energy consumption per day, for the last ${lastDays} days`);
      return await getTotalEnergyConsumption(lastDays);
    },
  },
})

schemaComposer.createObjectTC({
  name: 'Transaction',
  fields: {
    hash: 'String!',
    size: 'Int!',
    // energyConsumed = size * 4.56
    energyConsumed: 'Float!',
  },
});

schemaComposer.createObjectTC({
  name: 'EnergyConsumptionPerDay',
  fields: {
    startTime: {
      type: GraphQLBigInt,
    },
    endTime: {
      type: GraphQLBigInt,
    },
    totalEnergy: 'Float!',
  },
});

export const schema = schemaComposer.buildSchema()
