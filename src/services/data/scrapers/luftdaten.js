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
              archivesToSync.push(endpoint + link);
            }
          } catch (e) {
            // We don't care, if indices don't match we're not interested in the contents
          }
        }

        out.lastKey = last;
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
          html.parse(response).then(data => {
            let csvs = [];

            let table = data[2].children[3].children[3];
            let last = table.children.length - 1;
            for (let i = 0; i <= last; i++) {
              let tr = table.children[i];
              if (tr.type === 'text') {
                continue;
              }

              try {
                let csv = tr.children[1].children[0].children[0].raw;
                if (csv.endsWith('.csv')) {
                  csvs.push(archive + csv);
                }
              } catch (e) {
                // We don't care, if indices don't match we're not interested in the contents
              }
            }

            // TODO remove debug code
            if (csvs.length >= 10) {
              resolve(csvs);
            }

            if (csvs.length === 0) {
              // Something 's wrong, perhaps DOM change
              out.error = `Not a single csv found at ${archive}`;
              console.log(`Not a single csv found at ${archive}`);
            }

            resolve(csvs);
          });
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
