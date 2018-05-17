const { ecies } = require('@settlemint/lib-crypto');

const DELIMITER = '!#!';

function createDatasetListing(raw) {
  const priceInDtx = 0.5 * 10 ** -6;
  const stakeInDtx = Math.floor(Math.random() * 500) + 150;

  // ECIES encrypt credentials (just url for now) with private key of the gateway operator and public key of the custom-dapi
  const credentials = {
    url: ecies.encryptMessage(
      Buffer.from(process.env.DATAGATEWAY_PRIVATE_KEY, 'hex'),
      Buffer.from(process.env.CUSTOM_DAPI_PUBLIC_KEY, 'hex'),
      raw.url
    )
  };

  let dataset = {
    price: wDTX(priceInDtx).toString(),
    stakeamount: wDTX(stakeInDtx).toString(),
    metadata: {
      sensorid: `belgov${DELIMITER}${raw.name
        .replace(/ /g, '')
        .toLowerCase()}${DELIMITER}${raw.category}${DELIMITER}${raw.filetype}`,
      sensortype: 'DATASET',
      name: raw.name,
      example: JSON.stringify({ test: 'test' }),
      filetype: raw.filetype,
      category: raw.category,
      credentials
    }
  };

  return dataset;
}

function wDTX(dtx) {
  return dtx * 10 ** 18;
}

module.exports = {
  createDatasetListing
};
