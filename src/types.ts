export interface ILuftDatenSensorResource {
  id: number;
  sampling_rate: unknown;
  timestamp: string;
  location: {
    id: number;
    latitude: number;
    longitude: number;
  };
  sensor: {
    id: number;
    pin: number;
    sensor_type: {
      id: number;
      name: string;
      manufacturer: string;
    };
  };
  sensordatavalues: ISensordatavalue[];
}

export interface ISensordatavalue {
  id: number;
  value: number;
  value_type: string;
}

export interface ISensor {
  id: string;
  enlisted: boolean;
}

export interface ISensorEnlist {
  price: number;
  stakeamount: number;
  metadata: {
    name: string;
    sensorid: string;
    geo: {
      lat: number;
      lng: number;
    };
    type: string;
    example: string;
    updateinterval: number;
    sensortype: string;
  };
}
