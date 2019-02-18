import { DELIMITER } from '../config/dapi-config';

export function buildDatabaseDelimiterKey(
  origin: string,
  sensorId: number,
  sensorType: string
): string {
  return `${origin}${DELIMITER}${sensorId}${DELIMITER}${sensorType}`;
}

export function readDatabaseDelimiterKey(delimitedKey: string): string[] {
  return delimitedKey.split(DELIMITER);
}
