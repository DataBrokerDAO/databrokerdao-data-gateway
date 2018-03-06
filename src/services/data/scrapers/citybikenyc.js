const rp = require('request-promise');

// TODO haven't tested this yet
async function getStationStatusFeed(endpoint, out) {
  await rp(endpoint)
    .then(response => {
      let json = JSON.parse(response);

      // Return early if we've already fetched the last status
      if (out.lastKey >= json.last_updated) {
        return;
      }
      out.lastKey = json.last_updated;

      let url;
      json.data.en.feeds.forEach(feed => {
        if (feed.name === 'station_status') {
          url = feed.url;
        }
      });

      return url;
    })
    .catch(error => {
      out.error = error;
      console.log(error);
    });
}

module.exports = {
  getStationStatusFeed
};
