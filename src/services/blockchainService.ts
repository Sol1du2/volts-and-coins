import axios from 'axios';
import { Block, fromBlockData } from '../models/Block';
import config from '../config/config';

/// Fetches block data by its hash.
export async function getBlockByHash(hash: string): Promise<Block> {
  try {
    const url = `${config.blockchainBaseUrl}/rawblock/${hash}`;
    const response = await axios.get(url);

    return fromBlockData(response.data);
  } catch (error) {
    console.error('error fetching block data, ', error);
    throw new Error('failed to fetch block data');
  }
}

/// Fetches the block hashes for in the last 24h of a given timestamp
/// (in milliseconds).
/// Returns an array of block hashes (strings) which can then be used to fetch
/// full block details.
export async function getBlockHashesForTimestamp(timestamp: number): Promise<string[]> {
  try {
    const url = `${config.blockchainBaseUrl}/blocks/${timestamp}?format=json`;
    const response = await axios.get(url);

    const blockSummaries: { hash: string; time: number }[] = response.data;

    return blockSummaries.map(summary => summary.hash);
  } catch (error) {
    console.error('error fetching block hashes for timestamp:', error);
    throw new Error('failed to fetch block hashes');
  }
}
