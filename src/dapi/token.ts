import rp = require('request-promise');
import { DAPI_BASE_URL } from '../config/dapi-config';

async function approve(
  authToken: string,
  tokenAddress: string,
  spenderAddress: string,
  amount: string
) {
  return rp({
    method: 'POST',
    uri: DAPI_BASE_URL + `/dtxtoken/${tokenAddress}/approve`,
    body: {
      _spender: spenderAddress,
      _value: amount
    },
    headers: {
      Authorization: authToken
    },
    json: true
  });
}
