import express = require('express');

require('dotenv').load();

const app = express();
const intervalTimeInSeconds = 5;

function bootstrap() {
  setTimeout(bootstrap, 1000 * intervalTimeInSeconds);
}
bootstrap();
