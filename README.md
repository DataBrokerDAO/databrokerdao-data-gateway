This is a DataGateway middleware, acting as the GatewayProvider (e.g. Proximus) for demoing purposes. 
This middleware has sensor data flowing through it and will push that to the Custom DApi endpoint. 
In the .env file you'll find all config variables required to set this up.

```
ATLAS_CONNECTION_STRING=[enter your connection string]
ATLAS_DATABASE_NAME_DATAGATEWAY=[enter your desired mongo database, used databroker-datagateway]
ATLAS_DATABASE_NAME_DATABROKER_DAPI=[enter databrokerdao mongo database, used to check if sensor are enlisted]
MIDDLEWARE_PORT=[can be anything]
DATAGATEWAY_PRIVATE_KEY=[enter PK to ensure the middleware can enlist sensors for us]
DATABROKER_DAPI_BASE_URL=[databroker dapi base url]
NODE_ENV=[debug|production, note that cronjobs are env. dependant]
```
