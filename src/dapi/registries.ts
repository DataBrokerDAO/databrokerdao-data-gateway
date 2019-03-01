import axios from 'axios';

export async function listDtxTokenRegistry() {
  const response = await axios.get(`/localdtxtokenregistry/list`);
  return response.data.items[0].contractAddress;
}

export async function listStreamRegistry() {
  const response = await axios.get(`/sensorregistry/list?abi=false`);
  return response.data.base.contractAddress;
}

export async function functionListSensorRegistry() {
  const response = await axios.get(`/sensorregistry/list?abi=false`);
  return response.data.items;
}
