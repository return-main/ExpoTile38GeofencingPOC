import {HELPERS} from './constants'
import {Helper} from './helper'
import {Point} from 'geojson'

/**
 * Convertis les informations de la base de données tile38 en objets Helper
 * @param array
 */
function arrayToHelper(array: any[]): Helper {
  const token: string = array[0]
  const point: Point = JSON.parse(array[1])
  return ({
    exponentPushToken: token,
    latitude: point.coordinates[1],
    longitude: point.coordinates[0],
  })
}

/**
 * Trouve les assitants à proximité, dans un rayon de 500 metres par default
 * @param send_command
 * @param latitude
 * @param longitude
 * @param radius
 */
export async function getHelpers(send_command: (command: string, args?: any[]) => Promise<any>, latitude: number, longitude: number, radius = 500): Promise<Helper[]> {
  const reply = await send_command('NEARBY', [HELPERS, 'POINT', latitude, longitude, radius]);
  return reply[1].map(arrayToHelper);
}
