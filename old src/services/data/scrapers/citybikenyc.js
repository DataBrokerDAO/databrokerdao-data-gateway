const rp = require('request-promise');

async function getStations(endpoint, out) {
  let stations = await getFeed(endpoint, 'station_information');
  out.lastKey = stations.last_updated;
  return stations;
}

async function getStationStatuses(endpoint, out) {
  let statuses = await getFeed(endpoint, 'station_status');
  out.lastKey = statuses.last_updated;
  return statuses;
}

function getFeed(endpoint, name) {
  return rp(endpoint).then(response => {
    let json = JSON.parse(response);
    for (let i = 0, len = json.data.en.feeds.length; i < len; i++) {
      if (json.data.en.feeds[i].name === name) {
        return rp(json.data.en.feeds[i].url).then(response => {
          return JSON.parse(response);
        });
      }
    }
  });
}

module.exports = {
  getStations,
  getStationStatuses
};
