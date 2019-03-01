import axios from 'axios';

export async function requestEnlistSensor(
  metadata: string,
  stakeAmount: string,
  price: string
) {
  try {
    const response = await axios.post(`/sensorregistry/enlist`, {
      _metadata: metadata,
      _stakeAmount: stakeAmount,
      _price: price,
    });
    return response.data.uuid;
  } catch (error) {
    console.error('Failed to request sensor enlisting with error', error);
  }
}
