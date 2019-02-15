const rp = require('request-promise');
const dotenv = require('dotenv');
const rtrim = require('rtrim');

require('dotenv').load();

dotenv.config();

let authToken: string;

export async function authenticate() {
    if (!authenticated()) {
        //TODO:  Fix process.env
        let baseUrl: string = rtrim(process.env.DATABROKER_DAPI_BASE_URL || "https://dapi.databrokerdao.com/", '/');
        let options = {
            method: 'POST',
            uri: `${baseUrl}/accounts/authenticate`,
            body: {
                username: process.env.DAPI_USERNAME,
                password: process.env.DAPI_PASSWORD
            },
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            json: true
        };

        await rp(options)
            //TODO: Change file type
            .then((response: unknown) => {
                authToken = response.token;
            })
            .catch((error: string) => {
                console.log(error);
            });
    }

    return authToken;
}

function authenticated() {
    return typeof authToken !== 'undefined';
}
