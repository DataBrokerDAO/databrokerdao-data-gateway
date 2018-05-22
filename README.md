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
ATLAS_CONNECTION_STRING=              [enter your connection string]
ATLAS_DATABASE_NAME_DATAGATEWAY=      [enter your desired mongo database, used databroker-datagateway]
ATLAS_DATABASE_NAME_DATABROKER_DAPI=  [enter databrokerdao mongo database, used to check if sensor are enlisted]
MIDDLEWARE_PORT=                      [can be anything]
DATAGATEWAY_PRIVATE_KEY=              [enter PK to ensure the middleware can enlist sensors for us]
DATABROKER_DAPI_BASE_URL=             [databroker dapi base url]
DATABROKER_CUSTOM_DAPI_BASE_URL       [databroker custom dapi base url]
NODE_ENV=                             [debug|production, note that cronjobs are env. dependant]
CONCURRENCY=                          [request concurrency parameter]
```
