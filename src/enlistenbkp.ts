import async from 'async';
import * as auth from './databroker/auth';
import * as retry from 'async-retry';
import * as rp from "request-promise";
import {
    EventListeners
} from "aws-sdk";
import {
    promises
} from "fs";
import { enlistSensor } from './util/api';
import * as rtrim from 'rtrim';


require('dotenv').load();

const baseUrl: string = rtrim(
    process.env.DATABROKER_DAPI_BASE_URL || "https://dapi.databrokerdao.com/",
    "/"
);


//TODO: possibility for dictionary and array?
export async function enlistSensors(sensorDict) {
    
}

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
                    console.log(`Approving spender ${spenderAddress}, on token ${tokenAddress} for amount ${sensor.stakeamount}`);
                    approve(
                        authToken,
                        tokenAddress,
                        spenderAddress,
                        sensor.stakeamount
                    ).then(response => {
                        console.log('Step stepApproveDtxAmount succesfull, response was: ', response);
                        step(null, authToken, tokenAddress, response.uuid);
                    }).catch(error => {
                        console.log('TIS IER WI')
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


