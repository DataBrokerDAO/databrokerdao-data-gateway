const Promise = require('bluebird');
const rp = require('request-promise');
const html = require('../../util/html');

async function scanForArchives(endpoint, out) {
  let archivesToSync = [];
  await rp(endpoint)
    .then(response => {
      html.parse(response).then(data => {
        let table = data[2].children[3].children[3];
        let last = table.children.length - 1;

        for (let i = out.lastKey; i <= last; i++) {
          let tr = table.children[i];
          if (tr.type === 'text') {
            continue;
          }

          try {
            let link = tr.children[1].children[0].children[0].raw;
            if (link.endsWith('/')) {
              out.lastKey = i;
              archivesToSync.push(endpoint + link);
            }
          } catch (e) {
            // We don't care, if indices don't match we're not interested in the contents
          }
        }
      });
    })
    .catch(error => {
      out.error = error;
      console.log(error);
    });

  return archivesToSync;
}

async function scanArchivesForCsvs(archives, out) {
  let csvBuckets = await Promise.map(
    archives,
    archive => {
      return new Promise((resolve, reject) => {
        rp(archive).then(response => {
          let csvs = [];
          let regexp = /href="(.*.csv)"/g;
          let match = regexp.exec(response);
          while (match != null) {
            csvs.push(archive + match[1]);
            match = regexp.exec(response);
          }

          if (csvs.length === 0) {
            // Something 's wrong, perhaps DOM change
            out.error = `Not a single csv found at ${archive}`;
            console.log(`Not a single csv found at ${archive}`);
          }

          resolve(csvs);
        });
      });
    },
    {
      concurrency: 4
    }
  );

  // Flatten the list of csv url buckets
  let csvUrls = [].concat.apply([], csvBuckets);
  return csvUrls;
}

module.exports = {
  scanForArchives,
  scanArchivesForCsvs
};
