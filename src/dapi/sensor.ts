import axios from 'axios';

export async function enlistSensor(
  metadata: string,
  stakeAmount: string,
  price: string
) {
  const response = await axios.post(`/sensorregistry/enlist`, {
    _metadata: metadata,
    _stakeAmount: stakeAmount,
    _price: price,
  });
  return response.data.uuid;
}
