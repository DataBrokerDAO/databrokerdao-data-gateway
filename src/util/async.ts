import retry from 'async-retry';
import rp = require('request-promise');

export async function waitFor(authToken: string, url: string) {
  try {
    await retry(
      async bail => {
        const res = await rp({
          method: 'GET',
          uri: url,
          headers: {
            Authorization: authToken,
          },
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
        retries: 120,
      }
    );
  } catch (error) {
    console.error('Dtx tokens approval failed with error', error);
    throw error;
  }
}
