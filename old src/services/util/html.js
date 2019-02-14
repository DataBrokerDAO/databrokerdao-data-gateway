let htmlparser = require('htmlparser');

function parse(html) {
  return new Promise((resolve, reject) => {
    let handler = new htmlparser.DefaultHandler((error, dom) => {
      if (error) {
        return reject(error);
      }
      return resolve(dom);
    });

    let parser = new htmlparser.Parser(handler);
    parser.parseComplete(html);
  });
}

module.exports = {
  parse
}