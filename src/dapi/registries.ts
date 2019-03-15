import axios from 'axios';

export async function listDtxTokenRegistry(
  parameters: { [key: string]: string } = {}
) {
  try {
    const response = await axios.get(createDtxTokenRegistry(parameters));
    return response.data.items[0].contractAddress;
  } catch (error) {
    throw error;
  }
}

export async function listStreamRegistry(
  parameters: { [key: string]: string } = {}
) {
  try {
    const response = await axios.get(createSensorRegistryUrl(parameters));
    return response.data.base.contractAddress;
  } catch (error) {
    throw error;
  }
}

export async function listSensorRegistry(
  parameters: { [key: string]: string } = {}
) {
  try {
    const response = await axios.get(createSensorRegistryUrl(parameters));
    return response.data.items;
  } catch (error) {
    throw error;
  }
}

function createSensorRegistryUrl(parameters: { [key: string]: string } = {}) {
  let result = `/sensorregistry/list?`;
  for (const parameter of Object.keys(parameters)) {
    result += `&${parameter}=${encodeURIComponent(parameters[parameter])}`;
  }
  return result;
}

function createDtxTokenRegistry(parameters: { [key: string]: string } = {}) {
  let result = `/localdtxtokenregistry/list?`;
  for (const parameter of Object.keys(parameters)) {
    result += `&${parameter}=${encodeURIComponent(parameters[parameter])}`;
  }
  return result;
}
