import axios from 'axios';

export async function getListings() {
  try {
    const response = await axios(`/sensorregistry/list`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
