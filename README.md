# Volts and Coins!
## Introduction
This is a prototype assignment that calculates the energy consumption of BTC blocks.
Note: This is just an exercise for fun, the calculations are not to be taken seriously!

## Design considerations and limitations
- Because each BTC block contains a lot of transactions the code is designed to work with a cache to alleviate repeated
calls. Especially for requesting the consumption for an entire day this can not easily be done on fly without reaching
limits.
- A cron job is setup to periodically request the past data in a specified interval and store it.
For this exercise redis was used as it is simple, quick to setup and I'm familiar with it. But depending on the
requirements this might not be the best choice (or only choice) for production. For example, DynamoDB or S3 could be
more adequate as they are low maintenance, have built-in durability and are easier to work with an AWS-centric
environment.
This was taken into consideration in the design and the logic is separated from the caching/storage mechanism. It should
be fairly simple to plugin a different storage mechanism and even work with a combination of in-memory and permanent
storage.
- The data is stored in a way that it is easy to replace it with newer data. This means, for example, that when the
cronjob runs, it can easily update the data. For example, if a block that is still "not complete" was previously
requested and is cached with missing transactions.
- There is a config file with a list of envs that can be used for some system configuration.

### Limitations
- Requesting the total energy consumption in the past X days has the risk of containing some stale data (especially in
intervals closer to the current date) due to the fact that for this request we **only fetch data from the cache**.
This also means that, if the Cronjob fails we will have gaps in the data. Another side effect is that when the
application starts, it's not really possible to get to get old data, since nothing will be cached. This decision was
made for simplicity because requesting too many blocks has the potential of hitting rate limits very quickly. The focus
was on the design of the program itself, not details. It is obvious that only relying on the cache is not possible for
production. A potential strategy for improving this could be to parallelize the request of blocks, or even transactions
within blocks. This should be fairly easy to implement with, for example, an utility like `p-limit` and then wrapping
all the fetches in a `Promise.all`-like structure. This could be done when the missing data is too large and needs to be
requested on the fly.
- There is no mechanism for TTL for cached data. In production something like that should be implemented to prevent
infinite growth of data, especially for very old data that is rarely fetched.
- Due to the nature of the exercise I decided not to implement tests and focus on the design itself. However that would
be very important in a production environment.
- The `blockchainService` that takes care of making the requests to the block chain API is quite simple and does not
really validate the incoming data. Using something like `Zod` for schema validation would be a very good idea for
production
- While errors are caught and exceptions taken care of, the code mostly just logs issues. Adding a better error handling
system would be necessary after the prototype phase. Especially with attempts to retry/etc. The system is not robust
enough for weak connections, for example. This is all boilerplate that should be fairly simple to add in, hence why it
was left out for this exercise.

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

