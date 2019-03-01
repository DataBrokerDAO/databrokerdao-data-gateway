import axios from 'axios';

export async function listDtxTokenRegistry(authToken: string) {
  const response = await axios.get(`/localdtxtokenregistry/list`);
  return response.data.items[0].contractAddress;
}

export async function listStreamRegistry() {
  const response = await axios.get(`/sensorregistry/list`);
  return response.data.base.contractAddress;
}
