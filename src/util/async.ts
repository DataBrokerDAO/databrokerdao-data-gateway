import rp = require('request-promise');
import retry from 'async-retry';

export async function waitFor(authToken: string, url: string) {
  return await retry(
    async bail => {
      console.log(`Waiting for ${url}`);
      const res = await rp({
        method: 'GET',
        uri: url,
        headers: {
          Authorization: authToken
        }
      }).catch((error: Error) => {
        bail(error);
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
}
