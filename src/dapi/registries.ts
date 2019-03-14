import axios from 'axios';

export async function listDtxTokenRegistry() {
  try {
    const response = await axios.get(`/localdtxtokenregistry/list`);
    return response.data.items[0].contractAddress;
  } catch (error) {
    throw error;
  }
}

export async function listStreamRegistry() {
  try {
    const response = await axios.get(`/sensorregistry/list?abi=false`);
    return response.data.base.contractAddress;
  } catch (error) {
    throw error;
  }
}

export async function functionListSensorRegistry() {
  try {
    const response = await axios.get(`/sensorregistry/list?abi=false`);
    return response.data.items;
  } catch (error) {
    throw error;
  }
}
