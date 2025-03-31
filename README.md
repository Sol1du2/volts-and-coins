# Volts and Coins!
## Introduction
This is a prototype assignment that calculates the energy consumption of BTC blocks.
Note: This is just an exercise for fun, the calculations are not to be taken seriously! 😄

## Queries
### getBlockEnergy
- Purpose:
Fetches the energy consumption for each transaction in a specific block.

- Arguments:
  - blockHash (String!): The unique hash identifier of the block you want to inspect.

- Returns:
A list of Transaction objects. Each transaction includes:
  - hash: The transaction's unique identifier.
  - size: The size (in bytes) of the transaction.
  - energyConsumed: The computed energy consumption for the transaction (calculated as size * 4.56).

- Example:
```graphql
query {
  getBlockEnergy(blockHash: "0000000000000000000abcdef...") {
    hash
    size
    energyConsumed
  }
}
```

### getDailyEnergyConsumption
- Purpose:
Retrieves the aggregated energy consumption for each day over a specified number of past days.

- Arguments:
  - lastDays (Int!): The number of days (counting backwards from the current day) to aggregate energy consumption data for.

- Returns:
A list of EnergyConsumptionPerDay objects. Each object includes:
  - startTime: A Unix timestamp (in milliseconds) marking the beginning of the day (UTC).
  - endTime: The Unix timestamp marking the end of the day (UTC).
  - totalEnergy: The total energy consumption (in kWh) aggregated for that day.

- Example:
```graphql
query {
  getDailyEnergyConsumption(lastDays: 7) {
    startTime
    endTime
    totalEnergy
  }
}
```

## Design considerations and limitations
- Because each BTC block contains a lot of transactions the code is designed to work with a cache to alleviate repeated
calls. Especially when requesting the consumption for an entire day, this can't be easily done on fly without reaching
limits.
- A cronjob is setup to periodically request the past data in a specified interval and store it.
For this exercise redis was used as it is simple, quick to setup and I'm familiar with it. But depending on the
requirements this might not be the best choice (or only choice) for production. For example, DynamoDB or S3 could be
more adequate as they are low maintenance, have built-in durability and are easier to work with an AWS-centric
environment.
This was taken into consideration in the design and the logic is separated from the caching/storage mechanism. It should
be fairly simple to plugin a different storage mechanism and even work with a combination of in-memory and permanent
storage.
- The data is stored in a way that it is easy to replace it with newer data. This means, for example, that when the
cronjob runs, it can easily update the data.
- There is a config file with a list of envs that can be used for system configuration.

### Limitations
- Requesting the total energy consumption in the past X days has the risk of containing some stale data (especially in
intervals closer to the current date) due to the fact that for this request we **only fetch data from the cache**.
This also means that, if the cronjob fails, we will have gaps in the data. Another side effect is that when the
application starts, it won't possible to get to get old data, since nothing will be cached. This decision was
made for simplicity because requesting too many blocks has the potential of hitting rate limits very quickly. The focus
was on the design of the program itself, not details. It's obvious that only relying on the cache is not viable for
production. To make it easier to request higher intervals, concurrency was introduced using `p-limit`. This spawns a task
for each block request. This strategy could also be used to be able to fetch higher amounts of data on the fly, so the
data is less stale. It should be fairly easy to further improve the design.
- There is no mechanism for TTL for cached data. In production something like that should be implemented to prevent
infinite growth of data, especially for very old data that is rarely fetched.
- Due to the nature of the exercise I decided not to implement tests and focus on the design itself. However that would
be very important in a production environment. A test first approach is very important for easy to maintain code.
- The `blockchainService` that takes care of making the requests to the block chain API is quite simple and does not validate
the incoming data. Using something like `Zod` for schema validation would be a very good idea for production.
- While errors are caught and exceptions taken care of, the code mostly just logs issues. Adding better error handling
would be highly advised. Especially with attempts to retry/etc. The system is not robust enough for weak connections, for example.
This is all boilerplate that should be fairly simple to add in.

## Running the project
Requirements:
- NodeJS 16.x (run `nvm use` in root folder)
- Yarn cli
- Serverless framework: run `npm install -g serverless`

Install dependencies:

```sh
yarn
```

Run the serverless function in offline mode:

```sh
yarn start
```

The server will be ready at: `http://localhost:4000/graphql`

