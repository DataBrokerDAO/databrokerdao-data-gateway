import axios from 'axios';

export async function ipfs(metadata: object) {
  try {
    const response = await axios.post(`/v1/ipfs/add/json`, { data: metadata });
    return response.data[0].hash || response.data[0].Hash;
  } catch (error) {
    console.error('Failed to add json data to the dbdao ipfs storage', error);
    throw error;
  }
}
