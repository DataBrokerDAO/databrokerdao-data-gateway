# Data Gateway Middleware

# Info

This middleware acts as a GatewayProvider (e.g. Proximus), for demoing purposes.
These gateway providers have a ton of sensor data flowing through them, whenever
a sensor has new data it needs to push that data to the [Custom DApi](https://github.com/DataBrokerDAO/databrokerdao-custom-dapi).

Here we'll even enlist the sensors, in production however this won't be the case.
The sensors will have been enlisted through the UI by the sensor owner.

## Setup

In the .env file you'll find all config variables required to set this up.

```
MONGO_DB_URL=                         [enter your mongodb url]
MONGO_DB_NAME=                        [enter your desired mongo database, used databroker-datagateway]
MIDDLEWARE_PORT=                      [can be anything]
DAPI_USERNAME=                        [Your dapi username from https://dapp.databrokerdao.com/]
DAPI_PASSWORD=                        [Your dapi password from https://dapp.databrokerdao.com/]
DATABROKER_DAPI_BASE_URL=             [databroker dapi base url]
DATABROKER_CUSTOM_DAPI_BASE_URL       [databroker custom dapi base url]
NODE_ENV=                             [debug|production, note that cronjobs are env. dependant]
```
