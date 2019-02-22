export interface IRawLuftDatenSensor {
  id: number;
  sampling_rate: unknown;
  timestamp: string;
  location: {
    id: number;
    latitude: string;
    longitude: string;
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
  price: string;
  stakeamount: string;
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

export interface IStreamSensor {
  key: string;
  sensorid: number;
  value: number;
  value_type: string;
}
