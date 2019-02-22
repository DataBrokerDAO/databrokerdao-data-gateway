import axios from 'axios';
import { DAPI_BASE_URL } from '../config/dapi-config';

export async function getListings() {
  try {
    const response = await axios(`${DAPI_BASE_URL}/sensorregistry/list`);
  } catch (error) {
    throw error;
  }
}
``
