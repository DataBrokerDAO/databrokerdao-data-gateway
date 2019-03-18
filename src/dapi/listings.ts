import axios from 'axios';

export async function listSensorRegistry(
  parameters: { [key: string]: string } = {}
) {
  try {
    const response = await axios(createSensorRegistryUrl(parameters));
    return response.data;
  } catch (error) {
    return null;
  }
}

function createSensorRegistryUrl(parameters: { [key: string]: string } = {}) {
  let result = `/sensorregistry/list?`;
  for (const parameter of Object.keys(parameters)) {
    result += `&${parameter}=${encodeURIComponent(parameters[parameter])}`;
  }
  return result;
}
