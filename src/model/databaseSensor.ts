export class DatabaseSensor {
    id: number;
    type: string;
    location: Object;

    constructor(id: number, type: string, latitude: number , longitude: number) {
        this.id = id;
        this.type = type;
        this.location = {latitude, longitude};
    }
}

module.exports = {
    DatabaseSensor
}