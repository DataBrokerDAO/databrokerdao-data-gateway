import rp = require('request-promise');
import { DAPI_BASE_URL } from '../config/dapi-config';

export async function requestDtxAmountApproval(
  authToken: string,
  tokenAddress: string,
  spenderAddress: string,
  amount: number
) {
  try {
    console.log(
      `Attempting to request approval for ${amount} dtx tokens from tokenAddress ${tokenAddress} with tokens from ${spenderAddress}`
    );
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
    console.log(`Succesfully requested approval for ${amount} dtx tokens!`);
    return response.uuid;
  } catch (error) {
    console.error(
      `Failed to request approval for ${amount} dtx with error`,
      error
    );
    throw error;
  }
}
