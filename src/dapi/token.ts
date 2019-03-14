import axios from 'axios';

export async function approveDTX(
  tokenAddress: string,
  spenderAddress: string,
  amount: string
) {
  try {
    const response = await axios.post(`/dtxtoken/${tokenAddress}/approve`, {
      _spender: spenderAddress,
      _value: amount,
    });

    return response.data.uuid;
  } catch (error) {
    console.error(
      `Failed to request approval for ${amount} dtx with error`,
      error
    );
    throw error;
  }
}
