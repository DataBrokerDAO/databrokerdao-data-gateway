import axios from 'axios';
import axiosRetry from 'axios-retry';

const retryConfig = {
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 5000, // ms
  retries: 120,
};

export async function waitFor(url: string) {
  try {
    axiosRetry(axios, { retries: 120, retryDelay: exponentialRetry });
    const res = await axios.get(url);
    const data = JSON.parse(res.data);
    if (!(data && data.receipt)) {
      throw new Error('Tx not mined yet');
    }

    if (data.receipt.status === 0) {
      throw new Error(`Tx with hash ${data.hash} was reverted`);
    }

    return data.receipt;
  } catch (error) {
    console.error('Dtx tokens approval failed with error', error);
    throw error;
  }
}

function exponentialRetry(retryCount: number): number {
  let delay = retryConfig.minTimeout * 2 ** retryCount;
  if (delay <= 1000) {
    delay = 5000;
  }
  return Math.min(delay, retryConfig.maxTimeout);
}
