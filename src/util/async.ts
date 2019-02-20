import rp = require('request-promise');
import retry from 'async-retry';
import rtrim from 'rtrim';
import { DAPI_BASE_URL } from '../config/dapi-config';

export async function waitFor(
  authToken: string,
  tokenAddress: string,
  approveDtxAmountResponseUuid: string
) {
  try {
    console.log('Requesting approval response for requested dtx tokens');
    const url =
      rtrim(DAPI_BASE_URL, '/') +
      `/dtxtoken/${tokenAddress}/approve/${approveDtxAmountResponseUuid}`;
    await retry(
      async bail => {
        console.log(`Waiting for ${url}`);
        const res = await rp({
          method: 'GET',
          uri: url,
          headers: {
            Authorization: authToken
          }
        }).catch((error: Error) => {
          throw error;
        });

        const response = JSON.parse(res);
        if (!(response && response.receipt)) {
          throw new Error('Tx not mined yet');
        }

        if (response.receipt.status === 0) {
          bail(new Error(`Tx with hash ${response.hash} was reverted`));
          return;
        }

        return response.receipt;
      },
      {
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 5000, // ms
        retries: 120
      }
    );
    console.log('Dtx tokens succesfully approved!');
  } catch (error) {
    console.error('Dtx tokens approval failed with error', error);
    throw error;
  }
}
