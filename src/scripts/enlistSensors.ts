const model = require('../services/model/sensor');
const store = require('../services/mongo/store');
const registry = require('../services/databroker/registry');
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import { EventListeners } from 'aws-sdk';

EventListeners();