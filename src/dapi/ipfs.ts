import axios from 'axios';

export async function ipfs(metadata: object) {
  try {
    const response = await axios.post(`/v1/ipfs/add/json`, { data: metadata });
    return response.data[0].hash;
  } catch (error) {
    console.error(
      'Failed to add sensor metadata to databrokerdao ipfs storage with error',
      error
    );
    throw error;
  }
}
