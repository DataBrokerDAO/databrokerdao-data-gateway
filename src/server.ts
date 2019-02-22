import express = require('express');
import { lufdatenCron } from './services/stream';

require('dotenv').load();

const app = express();

function bootstrap() {
  console.log('I say every second hi! :D');
  setTimeout(bootstrap, 1000 * 1);
}

function init() {
  lufdatenCron();
}

init();
bootstrap();
