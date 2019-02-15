import { Interface } from "readline";

export interface ISensor {
    price: string,
    stakeamount: string,
    metadata: {
      name: string,
      sensorid: string,
      geo: {
        lat: number,
        lng: number
      },
      type: string,
      example: string,
      updateinterval: number,
      sensortype: string
    }
  };