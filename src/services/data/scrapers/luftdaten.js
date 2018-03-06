const Promise = require('bluebird');
const rp = require('request-promise');
const html = require('../../util/html');

async function scanForArchives(endpoint, out) {
  let archivesToSync = [];
  await rp(endpoint)
    .then(response => {
      html.parse(response).then(data => {
        try {
          let table = data[2].children[3].children[3];
          let last = table.children.length;

          for (var i = out.lastKey; i < table.children.length; i++) {
            let tr = table.children[i];
            if (tr.type === 'text') {
              continue;
            }

            let link = tr.children[1].children[0].children[0].raw;
            if (link.endsWith('/')) {
              archivesToSync.push(job.endpoint + link);
            }
          }

          out.lastKey = table.children.length;
        } catch (e) {
          // We don't care, if indices don't match we're not interested in the contents
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
          html.parse(response).then(data => {
            let csvs = [];

            try {
              let table = data[0].children[3].children[3];
              table.children.forEach(child => {
                if (child.type === 'text') {
                  return;
                }

                let csv = child.children[0].raw;
                if (csv.endsWith('.csv')) {
                  csvs.push(archive + csv);
                }
              });
            } catch (e) {
              // We don't care, if indices don't match we're not interested in the contents
            }

            if (!csvs.length === 0) {
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
