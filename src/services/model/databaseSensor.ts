import { Interface } from "readline";

export class DatabaseSensor {
    id: number;
    enlisted: boolean;

    constructor (id: number, enlisted: boolean) {
        this.id = id;
        this.enlisted = enlisted;
    }
}

export interface IDatabaseSensor {
    id: number;
    enlisted: boolean;
}

export interface ILuftdatenSensor {
        id: number,
        sampling_rate: unknown,
        timestamp: string,
        location: {
          id: number,
          latitude: number,
          longitude: number
        };
        sensor: {
          id: number,
          pin: number,
          sensor_type: {
            id: number,
            name: string,
            manufacturer: string
          }
        };
        sensordatavalues: sensordatavalue[];
}

export interface sensordatavalue {
    id: number,
    value: number,
    value_type: string
}