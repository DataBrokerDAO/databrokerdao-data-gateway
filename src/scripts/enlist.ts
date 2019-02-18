// const model = require('../services/model/sensor');
// const store = require('../services/mongo/store');
// const registry = require('../services/databroker/registry');
import async from "async";
import * as auth from "../services/databroker/auth";
import * as retry from 'async-retry';
import * as rp from "request-promise";
import * as rtrim from 'rtrim';
// rtrim = require("rtrim");
import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from "axios";
import {
    EventListeners
} from "aws-sdk";
import {
    promises
} from "fs";
import { get } from "lodash";
import { ILuftDatenSensorResource } from '../services/types';

//TODO: Improve this code to make it more readable
require("dotenv").config();

const baseUrl: string = rtrim(
    process.env.DATABROKER_DAPI_BASE_URL || "https://dapi.databrokerdao.com/",
    "/"
);

export async function enlistSensor(sensor) {
    //TODO:  Fix process.env
    let sensorId = sensor.metadata.sensorid;
    console.log(`Enlisting sensor ${sensorId}`);
    return new Promise((resolve, reject) => {
        async.waterfall(
            [
                function stepAuthenticate(step) {
                    auth.authenticate().then(authToken => {
                        console.log(`Success! Your authtoken is ${authToken}`);
                        step(null, authToken);
                    });
                },
                function stepIpfsHash(authToken, step) {
                    ipfs(authToken, sensor.metadata).then(response => {
                        console.log('Step ipfs succesfull, response was: ', response);
                        sensor.metadata = response[0].hash;
                        step(null, authToken);
                    });
                },
                function stepListDtxTokenRegistry(authToken, step) {
                    listDtxTokenRegistry(authToken).then(response => {
                        console.log('Step DtxTokenRegistry succesfull, response was: ', response);
                        let tokenAddress = response.items[0].contractAddress;
                        step(null, authToken, tokenAddress);
                    });
                },
                function stepListStreamRegistry(authToken, tokenAddress, step) {
                    listStreamRegistry(authToken).then(response => {
                        console.log('Step ListStreamRegistry succesfull, response was: ', response);
                        let spenderAddress = response.base.contractAddress;
                        step(null, authToken, spenderAddress, tokenAddress);
                    });
                },
                function stepApproveDtxAmount(
                    authToken,
                    spenderAddress,
                    tokenAddress,
                    step
                ) {
                    approve(
                        authToken,
                        tokenAddress,
                        spenderAddress,
                        sensor.stakeamount
                    ).then(response => {
                        console.log('Step stepApproveDtxAmount succesfull, response was: ', response);
                        step(null, authToken, tokenAddress, response.uuid);
                    });
                },
                function stepAwaitApproval(authToken, tokenAddress, uuid, step) {
                    const url =
                        rtrim(baseUrl, "/") +
                        `/dtxtoken/${tokenAddress}/approve/${uuid}`;
                    waitFor(authToken, url).then(response => {
                        console.log('Step AwaitApproval succesfull, response was: ', response);
                        step(null, authToken);
                    });
                },
                function stepEnlistSensor(authToken, step) {
                    enlist(authToken, sensor).then(response => {
                        console.log('Step EnlistSensor succesfull, response was: ', response);

                        step(null, authToken, response.uuid);
                    });
                },
                function stepAwaitEnlisting(authToken, uuid, step) {
                    const url =
                        rtrim(baseUrl, "/") +
                        `/sensorregistry/enlist/${uuid}`;
                    waitFor(authToken, url).then(response => {
                        console.log('Step AwaitEnlisting succesfull, response was: ', response);
                        step(null);
                    });
                },
                function done() {
                    console.log(`Successfully enlisted sensor ${sensorid}`);
                    resolve(sensorid);
                }
            ],
            error => {
                if (error) {
                    reject(error);
                }
            }
        );
    });
}

async function ipfs(authToken, metadata) {
    return rp({
        method: "POST",
        uri: rtrim(baseUrl, "/") + "/ipfs/add/json",
        body: {
            data: metadata
        },
        headers: {
            Authorization: authToken
        },
        json: true
    });
}

async function listDtxTokenRegistry(authToken) {
    return rp({
        method: "GET",
        uri: rtrim(baseUrl, "/") +
            "/dtxtokenregistry/list",
        headers: {
            Authorization: authToken
        },
        json: true
    });
}

async function listStreamRegistry(authToken) {
    return rp({
        method: "GET",
        uri: rtrim(baseUrl, "/") + "/sensorregistry/list",
        headers: {
            Authorization: authToken
        },
        json: true
    });
}

async function wallet(authToken) {
    return rp({
        method: "GET",
        uri: rtrim(baseUrl, "/") + "/wallet",
        headers: {
            Authorization: authToken
        },
        json: true
    });
}

async function allowance(
    authToken,
    tokenAddress,
    ownerAddress,
    spenderAddress
) {
    return rp({
        method: "GET",
        uri: rtrim(baseUrl, "/") +
            `/dtxtoken/${tokenAddress}/allowance?owner=${ownerAddress}&spender=${spenderAddress}`,
        headers: {
            Authorization: authToken
        },
        json: true
    });
}

async function approve(authToken, tokenAddress, spenderAddress, amount) {
    return rp({
        method: "POST",
        uri: rtrim(baseUrl, "/") +
            `/dtxtoken/${tokenAddress}/approve`,
        body: {
            _spender: spenderAddress,
            _value: amount
        },
        headers: {
            Authorization: authToken
        },
        json: true
    });
}

async function enlist(authToken, sensor) {
    return rp({
        method: "POST",
        uri: rtrim(baseUrl, "/") +
            "/sensorregistry/enlist",
        body: {
            _metadata: sensor.metadata,
            _stakeAmount: sensor.stakeamount,
            _price: sensor.price
        },
        headers: {
            Authorization: authToken,
            "Content-Type": "application/json"
        },
        json: true
    });
}

async function waitFor(authToken, url) {
    return await retry(
        async bail => {
            console.log(`Waiting for ${url}`);
            const res = await rp({
                method: "GET",
                uri: url,
                headers: {
                    Authorization: authToken
                }
            }).catch(error => {
                bail(error);
            });

            const response = JSON.parse(res);
            if (!(response && response.receipt)) {
                throw new Error("Tx not mined yet");
            }

            if (response.receipt.status === 0) {
                bail(new Error(`Tx with hash ${response.hash} was reverted`));
                return;
            }

            return response.receipt;
        }, {
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 5000, // ms
            retries: 120
        }
    );
}

// Pseudo code

const rawSensorDict = {};
function parse(dataJSONResponse: string) {
    for (const sensor of JSON.parse(dataJSONResponse)) {
        const key = buildKey(get(sensor, 'sensor.id'), get(sensor, 'sensor.sensor_type.id'));
        if (!rawSensorDict[key]) {
            rawSensorDict[key] = sensor;
        }
    }
}

const sensorDict = {};
async function enlistt() {
    // 1. download data.json from luftdaten API
    const data = await axios("http://api.luftdaten.info/static/v2/data.json");

    // 2. parse JSON into custom data structure and ensure you have a dictionary of all unique sensors
    await parse(data);

    // 3. loop every "sensor object" from the JSON and transform into a LuftDatenSensor type
    for (const key of Object.keys(rawSensorDict)) {
        let sensor = rawSensorDict[key];
        sensor = transformToLuftDatenSensor(rawSensorDict[key]);
        sensorDict[key] = sensor;
    }

    // 4. enlist sensor with DatabrokerDAO DAPI
    for (const key of Object.keys(rawSensorDict)) {
        const sensor = sensorDict[key];

        try {
        // TODO await enlistSensor(sensor)
        } catch(error) {
            console.log('Failed enlisting sensor w/ID:', error);
        }

        try {
            // TODO await markSensorAsEnlisted()
        } catch(error) {
            console.log('Failed marking sensor w/ID as enlisted:', error);
        }
        
    }
}

function markSensorAsEnlisted(sensor: ILuftDatenSensorResource) {
    // mongo
    // mongo.upsert ({
        // sensorId: whatever
        // enlisted: new Date()
    // })
}

function transformToLuftDatenSensor(sensor: data): ILuftDatenSensorResource {
    // return {
    //     price: '50',
    //     stakeamount: '400',
    //     metadata: {
    //       name: 'Test',
    //       sensorid: '345',
    //       geo: {
    //         lat: 12.145,
    //         lng: 19.93
    //       },
    //       type: 'UM12',
    //       example: 'example',
    //       updateinterval: 500,
    //       sensortype: 'UM14'
    //     }
    // }
}

function buildKey(sensorId: string, sensorType: string): string {
    return `LUFTDATEN${DELIMITER}${sensorId}${DELIMITER}${sensorType}`; 
}

const DELIMITER = '!##!';

enlistSensors();

