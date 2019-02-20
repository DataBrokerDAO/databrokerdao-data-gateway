import rp = require('request-promise');
import { DAPI_BASE_URL } from '../config/dapi-config';

export async function requestDtxAmountApproval(
  authToken: string,
  tokenAddress: string,
  spenderAddress: string,
  amount: string
) {
  try {
    const response = await rp({
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
    return response.uuid;
  } catch (error) {
    console.error(
      `Failed to request approval for ${amount} dtx with error`,
      error
    );
    throw error;
  }
}
